var WorkerPool = (function() {

    function Pool(workerUrl, size) {

        var pool = [];
        var queue = [];
        var ready = false;

        function run(task, callback) {
            if(ready) {
                if(pool.length) {
                    // available workers
                    var w = pool.shift();
                    w.onmessage = function(e) {
                       // console.log('worker is done');
                        // add the worker to the pool, is available for another task
                        pool.push(w);
                        // execute the first available task
                        if(queue.length) {
                            // remove first task from the queue and run it
                            //console.log('run from queue');
                            var t = queue.shift();
                            run(t.task, t.callback);
                        }
                        // invoke the callback
                        callback(e);
                    };
                    w.postMessage(task);
                } else {
                    // queue the task waiting for a worker to finish the previous one
                    queue.push({task: task, callback: callback});
                }
            } else {
                console.warn('Pool need to be initialized before run tasks');
            }
        }

        function init() {
            // create 'size' number of worker threads
            for (var i = 0; i < size; i++) {
                pool.push(new Worker(workerUrl));
            }
            ready = true;
        }

        function destroy() {
            for (var i = 0; i < size; i++) {
                pool[i].terminate();
            }
            pool = []; 
            ready = false;
        }

        return {
            init: init,
            run: run,
            destroy: destroy
        };
    }

    return {
        Pool: Pool
    };

})();

var exports = exports || null;
if (exports) {
    exports.WorkerPool = WorkerPool;
}