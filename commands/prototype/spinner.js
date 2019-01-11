const ora = require('ora');
const spawn = require('child_process').spawn;

function spinnerSpawner(spinnerConfig, cmd, args) {
  if (typeof(spinnerConfig) == "string") spinnerConfig = {
    text: spinnerConfig,
    color: "red",
    spinner: {
      interval: 80,
      frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    }
  }
  
  return new Promise(function(resolve, reject) {
    let spinner = ora(spinnerConfig).start();
    let sfdx = spawn(cmd, args);
      
    if (!sfdx.stdError) {
      resolve(spinner, sfdx);
    } else {
      reject(spinner, sfdx);
    }
  });
}

(function () {
  'use strict';

  module.exports = {
    topic: 'test',
    command: 'spinner',
    description: 'test cli spinner',
    help: 'help text for nab:test:spinner',
    flags: [],
    run(context) {
      spinnerSpawner("Display list...", "sfdx", ["force:org:list"])
        .then(function(spinner, proc) {
            spinner.stop('Successfully cloned repository');
            console.log(proc);
            return proc.stdout;
          }, function(spinner, proc) {
            spinner.fail('Error while cloning repository');
            throw new Error(proc.stderr);
          }
        )
    }
  };
}());

/*
Loading unicornsOra {
  options:
   { text: 'Loading unicorns',
     color: 'red',
     stream:
      WriteStream {
        connecting: false,
        _hadError: false,
        _handle: [Object],
        _parent: null,
        _host: null,
        _readableState: [Object],
        readable: false,
        domain: null,
        _events: [Object],
        _eventsCount: 5,
        _maxListeners: undefined,
        _writableState: [Object],
        writable: true,
        allowHalfOpen: false,
        _bytesDispatched: 36,
        _sockname: null,
        _writev: null,
        _pendingData: null,
        _pendingEncoding: '',
        server: null,
        _server: null,
        columns: 147,
        rows: 40,
        _type: 'tty',
        fd: 2,
        _isStdio: true,
        destroySoon: [Function: destroy],
        _destroy: [Function],
        [Symbol(asyncId)]: 5,
        [Symbol(bytesRead)]: 0 },
     spinner: { interval: 80, frames: [Array] } },
  spinner:
   { interval: 80,
     frames: [ '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏' ] },
  color: 'red',
  hideCursor: true,
  interval: 80,
  stream:
   WriteStream {
     connecting: false,
     _hadError: false,
     _handle:
      TTY {
        writeQueueSize: 0,
        owner: [Circular],
        onread: [Function: onread] },
     _parent: null,
     _host: null,
     _readableState:
      ReadableState {
        objectMode: false,
        highWaterMark: 16384,
        buffer: [Object],
        length: 0,
        pipes: null,
        pipesCount: 0,
        flowing: null,
        ended: false,
        endEmitted: false,
        reading: false,
        sync: true,
        needReadable: false,
        emittedReadable: false,
        readableListening: false,
        resumeScheduled: false,
        destroyed: false,
        defaultEncoding: 'utf8',
        awaitDrain: 0,
        readingMore: false,
        decoder: null,
        encoding: null },
     readable: false,
     domain: null,
     _events:
      { end: [Object],
        finish: [Function: onSocketFinish],
        _socketEnd: [Function: onSocketEnd],
        error: [Function: handleEPIPE],
        resize: [Function] },
     _eventsCount: 5,
     _maxListeners: undefined,
     _writableState:
      WritableState {
        objectMode: false,
        highWaterMark: 16384,
        finalCalled: false,
        needDrain: false,
        ending: false,
        ended: false,
        finished: false,
        destroyed: false,
        decodeStrings: false,
        defaultEncoding: 'utf8',
        length: 0,
        writing: false,
        corked: 0,
        sync: false,
        bufferProcessing: false,
        onwrite: [Function: bound onwrite],
        writecb: null,
        writelen: 0,
        bufferedRequest: null,
        lastBufferedRequest: null,
        pendingcb: 2,
        prefinished: false,
        errorEmitted: false,
        bufferedRequestCount: 0,
        corkedRequestsFree: [Object] },
     writable: true,
     allowHalfOpen: false,
     _bytesDispatched: 36,
     _sockname: null,
     _writev: null,
     _pendingData: null,
     _pendingEncoding: '',
     server: null,
     _server: null,
     columns: 147,
     rows: 40,
     _type: 'tty',
     fd: 2,
     _isStdio: true,
     destroySoon: [Function: destroy],
     _destroy: [Function],
     [Symbol(asyncId)]: 5,
     [Symbol(bytesRead)]: 0 },
  id:
   Timeout {
     _called: false,
     _idleTimeout: 80,
     _idlePrev:
      TimersList {
        _idleNext: [Circular],
        _idlePrev: [Circular],
        _timer: [Object],
        _unrefed: false,
        msecs: 80,
        nextTick: false },
     _idleNext:
      TimersList {
        _idleNext: [Circular],
        _idlePrev: [Circular],
        _timer: [Object],
        _unrefed: false,
        msecs: 80,
        nextTick: false },
     _idleStart: 3953,
     _onTimeout: [Function: bound render],
     _timerArgs: undefined,
     _repeat: 80,
     _destroyed: false,
     [Symbol(asyncId)]: 57,
     [Symbol(triggerAsyncId)]: 0 },
  frameIndex: 1,
  enabled: true,
  lineCount: 1,
  linesToClear: 1,
  [Symbol(text)]: 'Loading unicorns' }
 */