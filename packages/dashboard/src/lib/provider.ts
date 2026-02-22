import type { DataProvider } from './dataProvider';

let instance: DataProvider | null = null;

export function getDataProvider(): DataProvider {
  if (instance) return instance;

  const mode = process.env.NEXT_PUBLIC_DATA_PROVIDER || 'mock';

  if (mode === 'worker') {
    const { WorkerDataProvider } = require('./workerDataProvider');
    instance = new WorkerDataProvider();
  } else {
    const { MockDataProvider } = require('./mockDataProvider');
    instance = new MockDataProvider();
  }

  return instance!;
}
