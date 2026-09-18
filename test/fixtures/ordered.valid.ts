import path from 'path'


export const ROOT = path.resolve('.')

export const LIMITS = { max: 3 }

export enum Mode {
  Fast,
  Slow,
}


export type Options = { root: string; mode: Mode }

export interface Runner {
  run (options: Options): number
}


export class Job implements Runner {
  run (options: Options) {
    return options.root.length
  }
}


export const createJob = () => new Job()

export function describeJob (job: Job) {
  return job.run({ root: ROOT, mode: Mode.Fast })
}

export const registry = new Job()

export const factory = createJob()
