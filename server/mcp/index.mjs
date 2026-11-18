import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { z } from 'zod';
import { db } from '../db.mjs';
import { getSkills, createJob, runJob, getJobForTenant, listJobsForTenant } from '../engine/maestro.mjs';
import { listAgents } from '../agents/registry.mjs';
import { createApproval, listApprovals } from '../engine/policy.mjs';
import { readImageFile } from '../storage.mjs';
import { executeWorkflow, listWorkflows } from '../engine/workflow.mjs';

const tenantId=process.env.MSHKUR_MCP_TENANT_ID;
const userId=process.env.MSHKUR_MCP_USER_ID;
if(!tenantId||!userId){
  console.error('Set MSHKUR_MCP_TENANT_ID and MSHKUR_MCP_USER_ID before starting the local MCP server.');
  process.exit(1);
}
const user=db.prepare('SELECT id,tenant_id,role FROM users WHERE id=? AND tenant_id=?').get(userId,tenantId);
if(!user||!['owner','admin'].includes(user.role)){
  console.error('The configured MCP identity must be an owner or admin in the selected tenant.');
  process.exit(1);
}

const server=new McpServer({name:'mshkur-local-tools',version:'0.2.0'});
const textResult=value=>({content:[{type:'text',text:JSON.stringify(value,null,2)}]});
const errorResult=message=>({isError:true,content:[{type:'text',text:message}]});

server.registerTool('mshkur_status',{
  description:'Return local MSHKUR engine status. Read-only.',
  annotations:{readOnlyHint:true,openWorldHint:false},
  inputSchema:z.object({})
},async()=>textResult({service:'MSHKUR OS',status:'local',tenantScoped:true,externalActionsEnabled:false}));

server.registerTool('mshkur_list_skills',{
  description:'List installed MSHKUR skills and their execution runtimes. Read-only.',
  annotations:{readOnlyHint:true,openWorldHint:false},
  inputSchema:z.object({})
},async()=>textResult({skills:getSkills()}));

server.registerTool('mshkur_list_agents',{
  description:'List MSHKUR specialist agents and their assigned skills. Read-only.',
  inputSchema:{}
},async()=>textResult({agents:listAgents()}));

server.registerTool('mshkur_list_vehicles',{
  description:'List vehicles belonging only to the configured MSHKUR tenant. Read-only.',
  annotations:{readOnlyHint:true,openWorldHint:false},
  inputSchema:z.object({limit:z.number().int().min(1).max(100).default(50)})
},async({limit})=>{
  const vehicles=db.prepare('SELECT id,make,model,trim,year,mileage,fuel,transmission,color,price,currency,city,status,notes,created_at,updated_at FROM vehicles WHERE tenant_id=? ORDER BY created_at DESC LIMIT ?').all(tenantId,limit);
  return textResult({vehicles});
});

server.registerTool('mshkur_list_tasks',{
  description:'List recent tasks for the configured MSHKUR tenant. Read-only.',
  annotations:{readOnlyHint:true,openWorldHint:false},
  inputSchema:z.object({limit:z.number().int().min(1).max(100).default(30)})
},async({limit})=>textResult({tasks:listJobsForTenant(tenantId,limit)}));

server.registerTool('mshkur_get_task',{
  description:'Get a task and its result by ID, scoped to the configured tenant.',
  annotations:{readOnlyHint:true,openWorldHint:false},
  inputSchema:z.object({taskId:z.string().uuid()})
},async({taskId})=>{
  const task=getJobForTenant(taskId,tenantId);
  return task?textResult({task}):errorResult('Task not found in this tenant.');
});

server.registerTool('mshkur_run_skill',{
  description:'Run an installed local server skill. Does not publish, send messages, purchase, or call external services.',
  annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false},
  inputSchema:z.object({skillId:z.string().min(2).max(100),input:z.record(z.string(),z.unknown())})
},async({skillId,input})=>{
  const skill=getSkills().find(item=>item.id===skillId);
  if(!skill)return errorResult('Unknown skill.');
  if(JSON.stringify(input).length>32000)return errorResult('Skill input is too large.');
  if(skill.runtime==='browser')return errorResult('This skill runs in the browser and cannot be executed by the local server MCP tool.');
  if(['image-optimize','license-plate-blur-region'].includes(skillId)){
    if(typeof input.imageFileId!=='string')return errorResult('Provide an imageFileId already uploaded to this tenant.');
    try{readImageFile(input.imageFileId,tenantId);}catch{return errorResult('Image file not found in this tenant.');}
  }
  try{
    const job=createJob({tenantId,userId,skillId,input});
    await runJob(job.id);
    return textResult({task:getJobForTenant(job.id,tenantId)});
  }catch(error){return errorResult(error.message||'Skill execution failed.');}
});

server.registerTool('mshkur_list_approvals',{
  description:'List pending and recent external-action approvals for the configured tenant. Read-only.',
  inputSchema:{}
},async()=>textResult({approvals:listApprovals(tenantId)}));

server.registerTool('mshkur_create_approval',{
  description:'Create a pending approval record for an external action. This does not execute that action.',
  annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false},
  inputSchema:z.object({
    actionType:z.enum(['send_message','publish_listing','share_data','delete_resource','purchase','modify_external_record']),
    payload:z.record(z.string(),z.unknown())
  })
},async({actionType,payload})=>{
  try{return textResult({approval:createApproval({tenantId,userId,actionType,payload})});}
  catch(error){return errorResult(error.message||'Could not create approval.');}
});

server.registerTool('mshkur_list_workflows',{
  description:'List available MSHKUR workflows. Read-only.',
  annotations:{readOnlyHint:true,openWorldHint:false},
  inputSchema:z.object({})
},async()=>textResult({workflows:listWorkflows()}));

server.registerTool('mshkur_run_workflow',{
  description:'Run an approved local workflow for a vehicle in the configured tenant. No external publication or messaging.',
  annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false},
  inputSchema:z.object({workflowId:z.string().min(2).max(100),vehicleId:z.string().uuid()})
},async({workflowId,vehicleId})=>{
  try{
    const workflow=await executeWorkflow({workflowId,tenantId,userId,input:{vehicleId}});
    return textResult({workflow});
  }catch(error){return errorResult(error.message||'Workflow execution failed.');}
});

const transport=new StdioServerTransport();
await server.connect(transport);
console.error('MSHKUR local MCP server connected over stdio.');
