import type { InMemorySmartGraphRepository } from './smartGraph.mjs';
export interface CatalogSkill { id:string; name?:string; version?:string; status?:string; license?:string; permissions?:string[]; engine?:{provider?:string} }
export interface CatalogAssistant { id:string; name?:string; nameAr?:string; canHandoff?:boolean; skills?:string[] }
export interface CatalogWorkflow { id:string; name?:string; nameAr?:string; version?:string; steps?:Array<{id?:string;skillId?:string;assistantId?:string}> }
export function indexCapabilityCatalog(graph: InMemorySmartGraphRepository, catalog?: {
 skills?:CatalogSkill[]; assistants?:CatalogAssistant[]; workflows?:CatalogWorkflow[]
}): {skills:number;assistants:number;workflows:number;relationships:number;unresolved:Array<Record<string,unknown>>};
