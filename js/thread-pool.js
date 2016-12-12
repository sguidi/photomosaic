/**
 * Manage a size limited pool of Web workers
 * Allow for queue of tasks
 */
var ThreadPool = (function () {

    /**
     * Create the pool of workers
     * @param {string} workerURL - The worker script URL
     * @param {number} size - The quantity of workers available in the pool 
     */
    function Pool(workerURL, size) {
        // workers
        var pool = [];
        // queued tasks
        var queue = [];
        // pool is ready to execute after initialization completed
        var ready = false;

        /**
         * Request the pool to execute a task
         * @param {object} task - data for the worker
         * @param {Function} callback - function to be executed on task completed 
         */
        function run(task, callback) {
            if (ready) {
                if (pool.length) {
                    // there are available workers to excecute this task immediately, pick up one from the pool 
                    var w = pool.shift();
                    // on task completed place the worker back into the pool and execute the callback
                    w.onmessage = function (e) {
                        // add the worker to the pool, is available for another task
                        pool.push(w);
                        // check if any task is waiting for, eventually execute the first one
                        if (queue.length) {
                            // remove first task from the queue and ask to run it
                            var t = queue.shift();
                            run(t.task, t.callback);
                        }
                        // invoke the callback
                        callback(e);
                    };
                    // run the task via worker
                    w.postMessage(task);
                } else {
                    // no workers available right now, queue the task
                    queue.push({ task: task, callback: callback });
                }
            } else {
                console.warn('Pool need to be initialized before run tasks');
            }
        }

        /**
         * Initialize the pool with specified size web workers
         */
        function init() {
            for (var i = 0; i < size; i++) {
                pool.push(new Worker(workerURL));
            }
            // pool is ready to run tasks
            ready = true;
        }

        /**
         * Clean up the memory from pool workes, the pool need to be re-Initialize to execute new tasks 
         */
        function destroy() {
            console.log('Pool destroy');
            // Remove pending tasks
            queue = [];
            // Terminate workers
            pool.forEach(function (w) { w.terminate(); });
            pool = [];
            // Set pool in invalid status
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
    exports.ThreadPool = ThreadPool;
}