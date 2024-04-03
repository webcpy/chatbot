const { promisify } = require('util');
const { spawn } = require('child_process');
// 将 spawn 方法封装成异步函数
const executeCommand = promisify((command, args, callback) => {
  const child = spawn(command, args);

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', data => {
    stdout += data;
  });

  child.stderr.on('data', data => {
    stderr += data;
  });

  child.on('exit', code => {
    if (code !== 0) {
      const error: any = new Error(
        `Command '${command}' exited with code ${code}`
      );
      error.stdout = stdout;
      error.stderr = stderr;
      callback(error);
      return;
    }
    callback(null, stdout, stderr);
  });
});

// 使用异步函数执行命令
export async function initVoice() {
  try {
    await executeCommand('wx-voice', ['compile']);
  } catch (error) {
    console.error(`执行命令时出错： ${error}`);
  }
}
