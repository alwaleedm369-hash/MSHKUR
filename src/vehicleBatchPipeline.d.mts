export type VehicleBatchItem = { id?: string; [key:string]: unknown };
export type VehicleBatchResult<T> = { id:string; status:'ready'|'needs-review'|'failed'; result:T|null; error:string|null };
export type VehicleBatchProgress<T> = { index:number; total:number; item:T; status:'processing'|'ready'|'needs-review'|'failed'; id?:string; result?:unknown; error?:string|null };
export function runVehicleBatch<T extends VehicleBatchItem, R extends {review?:{status?:string}}>(items:T[],processItem:(item:T,index:number)=>Promise<R>,options?:{onProgress?:(event:VehicleBatchProgress<T>)=>void;stopOnError?:boolean}):Promise<{total:number;completed:number;results:VehicleBatchResult<R>[];status:'completed'|'completed-with-errors'|'needs-review'}>;
