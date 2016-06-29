'use-strict';
var monitor = require('./../monitor.js');
var done = task => {
  process.send({
    workerEvent: 'taskResponse',
    taskId: task.taskId,
    response: {
      value: task.payload.data,
      workerId: task.taskId
    }
  });
};
process.on('message', function(msg) {
  if (!msg) {
    return;
  }
  // `electron-workers` verify worker is alive sending a `ping` event
  if (msg.workerEvent === 'ping') {
    // Notify `electron-workers` that the process is alive
    process.send({workerEvent: 'pong'});
  } else if (msg.workerEvent === 'task') {
    if (msg.payload.eventName === 'get') {
      console.log(msg); // data -> { workerEvent: 'task', taskId: '....', payload: <whatever you have passed to `.execute`> }

      console.log(msg.payload.data); // -> someData

      // you can do whatever you want here..

      monitor.start(result => {
        msg.payload.data = result;
        done(msg);
        // when the task has been processed,
        // respond with a `taskResponse` event, the `taskId` that you have received, and a custom `response`.
        // You can specify an `error` field if you want to indicate that something went wrong
      });
    } else if (msg.payload.eventName === 'run') {
      console.log(msg.payload);
      monitor._runTask(msg.payload.data.task, msg.payload.data.path, result => {
        msg.payload.data = result;
        done(msg);
      });
    }
  }
});
