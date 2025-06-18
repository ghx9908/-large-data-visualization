// 定义 Worker 上下文类型
const ctx: Worker = self as any;

// 监听主线程发送的消息
ctx.addEventListener('message', (event) => {
  const { data, type } = event.data;

  switch (type) {
    case 'CALCULATE':
      // 模拟一个耗时的计算任务
      const result = calculateResult(data);
      // 将结果发送回主线程
      ctx.postMessage({
        type: 'CALCULATE_COMPLETE',
        result
      });
      break;
  }
});

// 模拟一个耗时的计算函数
function calculateResult(data: number[]): number {
  // 模拟复杂计算
  let result = 0;
  for (let i = 0; i < data.length; i++) {
    result += Math.sqrt(data[i]) * Math.sin(data[i]);
  }
  return result;
}

// 导出 Worker 上下文
export { }; 
