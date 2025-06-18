import React, { useState, useEffect } from 'react';

const WorkerDemo: React.FC = () => {
  const [result, setResult] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    // 创建 Worker 实例
    const workerInstance = new Worker(
      new URL('../workers/dataWorker.ts', import.meta.url),
      { type: 'module' }
    );

    // 设置 Worker 消息处理
    workerInstance.onmessage = (event) => {
      const { type, result } = event.data;
      if (type === 'CALCULATE_COMPLETE') {
        setResult(result);
        setIsCalculating(false);
      }
    };

    setWorker(workerInstance);

    // 组件卸载时终止 Worker
    return () => {
      workerInstance.terminate();
    };
  }, []);

  const handleCalculate = () => {
    if (!worker) return;

    setIsCalculating(true);
    // 生成一些测试数据
    const testData = Array.from({ length: 1000000 }, (_, i) => i + 1);

    // 发送数据到 Worker
    worker.postMessage({
      type: 'CALCULATE',
      data: testData
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Web Worker 演示</h1>

      <button
        onClick={handleCalculate}
        disabled={isCalculating}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {isCalculating ? '计算中...' : '开始计算'}
      </button>

      {result !== null && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">计算结果：</h2>
          <p className="text-lg">{result}</p>
        </div>
      )}

      <div className="mt-4 text-gray-600">
        <p>这个示例展示了如何使用 Web Worker 进行耗时计算：</p>
        <ul className="list-disc pl-5 mt-2">
          <li>点击按钮会触发一个耗时的计算任务</li>
          <li>计算在 Worker 线程中进行，不会阻塞主线程</li>
          <li>计算完成后，结果会显示在页面上</li>
        </ul>
      </div>
    </div>
  );
};

export default WorkerDemo; 
