/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "perf_hooks":
/*!*****************************!*\
  !*** external "perf_hooks" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("perf_hooks");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "worker_threads":
/*!*********************************!*\
  !*** external "worker_threads" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("worker_threads");

/***/ }),

/***/ "(ssr)/../src/workers/local-asr.worker.js":
/*!******************************************!*\
  !*** ../src/workers/local-asr.worker.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// Web Worker for Local Speech Recognition using Transformers.js\n// This runs off the main thread to prevent UI freezing.\nlet transcriber = null;\nlet pipelinePromise = null;\n// Dynamic import for module environment\n// User must ensure @xenova/transformers is installed\n// or a CDN URL is used if preferred.\n// import { pipeline, env } from '@xenova/transformers';\nself.onmessage = async (event)=>{\n    const { type, data } = event.data;\n    if (type === \"init\") {\n        await initializeModel(data);\n    } else if (type === \"process\") {\n        await processAudio(data);\n    }\n};\nasync function initializeModel(config = {}) {\n    try {\n        // Fallback import if not bundled\n        let pipeline, env;\n        try {\n            const module = await Promise.all(/*! import() */[__webpack_require__.e(\"vendor-chunks/@xenova\"), __webpack_require__.e(\"vendor-chunks/onnxruntime-common\"), __webpack_require__.e(\"vendor-chunks/@huggingface\"), __webpack_require__.e(\"vendor-chunks/onnxruntime-web\"), __webpack_require__.e(\"_2bb2-_1dfa\")]).then(__webpack_require__.bind(__webpack_require__, /*! @xenova/transformers */ \"(ssr)/../node_modules/@xenova/transformers/src/transformers.js\"));\n            pipeline = module.pipeline;\n            env = module.env;\n        } catch (e) {\n            // CDN Callback if local import fails (optional fallback for 0-setup)\n            // import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.14.0/dist/transformers.min.js');\n            postMessage({\n                type: \"error\",\n                error: \"Transformers.js not found. Please install @xenova/transformers\"\n            });\n            return;\n        }\n        // Configure environment\n        env.allowLocalModels = false; // Force CDN for \"0 setup\"\n        env.useBrowserCache = true;\n        if (!pipelinePromise) {\n            postMessage({\n                type: \"status\",\n                status: \"loading\"\n            });\n            pipelinePromise = pipeline(\"automatic-speech-recognition\", config.model || \"Xenova/whisper-tiny.en\", {\n                progress_callback: (data)=>{\n                    postMessage({\n                        type: \"progress\",\n                        data\n                    });\n                }\n            });\n            transcriber = await pipelinePromise;\n            postMessage({\n                type: \"status\",\n                status: \"ready\"\n            });\n        } else {\n            postMessage({\n                type: \"status\",\n                status: \"ready\"\n            });\n        }\n    } catch (err) {\n        postMessage({\n            type: \"error\",\n            error: err.message\n        });\n    }\n}\nasync function processAudio(audioData) {\n    if (!transcriber) {\n        postMessage({\n            type: \"error\",\n            error: \"Model not initialized\"\n        });\n        return;\n    }\n    try {\n        // Run transcription\n        // audioData should be Float32Array\n        const result = await transcriber(audioData, {\n            chunk_length_s: 30,\n            stride_length_s: 5,\n            task: \"transcribe\",\n            return_timestamps: false\n        });\n        const text = result.text || \"\";\n        if (text.trim().length > 0) {\n            postMessage({\n                type: \"result\",\n                transcript: text.trim(),\n                isFinal: true\n            });\n        }\n    } catch (err) {\n        postMessage({\n            type: \"error\",\n            error: err.message\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vc3JjL3dvcmtlcnMvbG9jYWwtYXNyLndvcmtlci5qcyIsIm1hcHBpbmdzIjoiO0FBQ0EsZ0VBQWdFO0FBQ2hFLHdEQUF3RDtBQUV4RCxJQUFJQSxjQUFjO0FBQ2xCLElBQUlDLGtCQUFrQjtBQUV0Qix3Q0FBd0M7QUFDeEMscURBQXFEO0FBQ3JELHFDQUFxQztBQUNyQyx3REFBd0Q7QUFFeERDLEtBQUtDLFNBQVMsR0FBRyxPQUFPQztJQUNwQixNQUFNLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFLEdBQUdGLE1BQU1FLElBQUk7SUFFakMsSUFBSUQsU0FBUyxRQUFRO1FBQ2pCLE1BQU1FLGdCQUFnQkQ7SUFDMUIsT0FBTyxJQUFJRCxTQUFTLFdBQVc7UUFDM0IsTUFBTUcsYUFBYUY7SUFDdkI7QUFDSjtBQUVBLGVBQWVDLGdCQUFnQkUsU0FBUyxDQUFDLENBQUM7SUFDdEMsSUFBSTtRQUNBLGlDQUFpQztRQUNqQyxJQUFJQyxVQUFVQztRQUNkLElBQUk7WUFDQSxNQUFNQyxTQUFTLE1BQU0sNGFBQU87WUFDNUJGLFdBQVdFLE9BQU9GLFFBQVE7WUFDMUJDLE1BQU1DLE9BQU9ELEdBQUc7UUFDcEIsRUFBRSxPQUFPRSxHQUFHO1lBQ1IscUVBQXFFO1lBQ3JFLCtGQUErRjtZQUMvRkMsWUFBWTtnQkFBRVQsTUFBTTtnQkFBU1UsT0FBTztZQUFpRTtZQUNyRztRQUNKO1FBRUEsd0JBQXdCO1FBQ3hCSixJQUFJSyxnQkFBZ0IsR0FBRyxPQUFPLDBCQUEwQjtRQUN4REwsSUFBSU0sZUFBZSxHQUFHO1FBRXRCLElBQUksQ0FBQ2hCLGlCQUFpQjtZQUNsQmEsWUFBWTtnQkFBRVQsTUFBTTtnQkFBVWEsUUFBUTtZQUFVO1lBRWhEakIsa0JBQWtCUyxTQUFTLGdDQUFnQ0QsT0FBT1UsS0FBSyxJQUFJLDBCQUEwQjtnQkFDakdDLG1CQUFtQixDQUFDZDtvQkFDaEJRLFlBQVk7d0JBQUVULE1BQU07d0JBQVlDO29CQUFLO2dCQUN6QztZQUNKO1lBRUFOLGNBQWMsTUFBTUM7WUFDcEJhLFlBQVk7Z0JBQUVULE1BQU07Z0JBQVVhLFFBQVE7WUFBUTtRQUNsRCxPQUFPO1lBQ0hKLFlBQVk7Z0JBQUVULE1BQU07Z0JBQVVhLFFBQVE7WUFBUTtRQUNsRDtJQUNKLEVBQUUsT0FBT0csS0FBSztRQUNWUCxZQUFZO1lBQUVULE1BQU07WUFBU1UsT0FBT00sSUFBSUMsT0FBTztRQUFDO0lBQ3BEO0FBQ0o7QUFFQSxlQUFlZCxhQUFhZSxTQUFTO0lBQ2pDLElBQUksQ0FBQ3ZCLGFBQWE7UUFDZGMsWUFBWTtZQUFFVCxNQUFNO1lBQVNVLE9BQU87UUFBd0I7UUFDNUQ7SUFDSjtJQUVBLElBQUk7UUFDQSxvQkFBb0I7UUFDcEIsbUNBQW1DO1FBQ25DLE1BQU1TLFNBQVMsTUFBTXhCLFlBQVl1QixXQUFXO1lBQ3hDRSxnQkFBZ0I7WUFDaEJDLGlCQUFpQjtZQUNqQkMsTUFBTTtZQUNOQyxtQkFBbUI7UUFDdkI7UUFFQSxNQUFNQyxPQUFPTCxPQUFPSyxJQUFJLElBQUk7UUFDNUIsSUFBSUEsS0FBS0MsSUFBSSxHQUFHQyxNQUFNLEdBQUcsR0FBRztZQUN4QmpCLFlBQVk7Z0JBQUVULE1BQU07Z0JBQVUyQixZQUFZSCxLQUFLQyxJQUFJO2dCQUFJRyxTQUFTO1lBQUs7UUFDekU7SUFDSixFQUFFLE9BQU9aLEtBQUs7UUFDVlAsWUFBWTtZQUFFVCxNQUFNO1lBQVNVLE9BQU9NLElBQUlDLE9BQU87UUFBQztJQUNwRDtBQUNKIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vanN2b2ljZS1kZW1vLy4uL3NyYy93b3JrZXJzL2xvY2FsLWFzci53b3JrZXIuanM/NWUyOSJdLCJzb3VyY2VzQ29udGVudCI6WyJcclxuLy8gV2ViIFdvcmtlciBmb3IgTG9jYWwgU3BlZWNoIFJlY29nbml0aW9uIHVzaW5nIFRyYW5zZm9ybWVycy5qc1xyXG4vLyBUaGlzIHJ1bnMgb2ZmIHRoZSBtYWluIHRocmVhZCB0byBwcmV2ZW50IFVJIGZyZWV6aW5nLlxyXG5cclxubGV0IHRyYW5zY3JpYmVyID0gbnVsbDtcclxubGV0IHBpcGVsaW5lUHJvbWlzZSA9IG51bGw7XHJcblxyXG4vLyBEeW5hbWljIGltcG9ydCBmb3IgbW9kdWxlIGVudmlyb25tZW50XHJcbi8vIFVzZXIgbXVzdCBlbnN1cmUgQHhlbm92YS90cmFuc2Zvcm1lcnMgaXMgaW5zdGFsbGVkXHJcbi8vIG9yIGEgQ0ROIFVSTCBpcyB1c2VkIGlmIHByZWZlcnJlZC5cclxuLy8gaW1wb3J0IHsgcGlwZWxpbmUsIGVudiB9IGZyb20gJ0B4ZW5vdmEvdHJhbnNmb3JtZXJzJztcclxuXHJcbnNlbGYub25tZXNzYWdlID0gYXN5bmMgKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zdCB7IHR5cGUsIGRhdGEgfSA9IGV2ZW50LmRhdGE7XHJcblxyXG4gICAgaWYgKHR5cGUgPT09ICdpbml0Jykge1xyXG4gICAgICAgIGF3YWl0IGluaXRpYWxpemVNb2RlbChkYXRhKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3Byb2Nlc3MnKSB7XHJcbiAgICAgICAgYXdhaXQgcHJvY2Vzc0F1ZGlvKGRhdGEpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZU1vZGVsKGNvbmZpZyA9IHt9KSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIC8vIEZhbGxiYWNrIGltcG9ydCBpZiBub3QgYnVuZGxlZFxyXG4gICAgICAgIGxldCBwaXBlbGluZSwgZW52O1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1vZHVsZSA9IGF3YWl0IGltcG9ydCgnQHhlbm92YS90cmFuc2Zvcm1lcnMnKTtcclxuICAgICAgICAgICAgcGlwZWxpbmUgPSBtb2R1bGUucGlwZWxpbmU7XHJcbiAgICAgICAgICAgIGVudiA9IG1vZHVsZS5lbnY7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAvLyBDRE4gQ2FsbGJhY2sgaWYgbG9jYWwgaW1wb3J0IGZhaWxzIChvcHRpb25hbCBmYWxsYmFjayBmb3IgMC1zZXR1cClcclxuICAgICAgICAgICAgLy8gaW1wb3J0KCdodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbnBtL0B4ZW5vdmEvdHJhbnNmb3JtZXJzQDIuMTQuMC9kaXN0L3RyYW5zZm9ybWVycy5taW4uanMnKTtcclxuICAgICAgICAgICAgcG9zdE1lc3NhZ2UoeyB0eXBlOiAnZXJyb3InLCBlcnJvcjogJ1RyYW5zZm9ybWVycy5qcyBub3QgZm91bmQuIFBsZWFzZSBpbnN0YWxsIEB4ZW5vdmEvdHJhbnNmb3JtZXJzJyB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29uZmlndXJlIGVudmlyb25tZW50XHJcbiAgICAgICAgZW52LmFsbG93TG9jYWxNb2RlbHMgPSBmYWxzZTsgLy8gRm9yY2UgQ0ROIGZvciBcIjAgc2V0dXBcIlxyXG4gICAgICAgIGVudi51c2VCcm93c2VyQ2FjaGUgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiAoIXBpcGVsaW5lUHJvbWlzZSkge1xyXG4gICAgICAgICAgICBwb3N0TWVzc2FnZSh7IHR5cGU6ICdzdGF0dXMnLCBzdGF0dXM6ICdsb2FkaW5nJyB9KTtcclxuXHJcbiAgICAgICAgICAgIHBpcGVsaW5lUHJvbWlzZSA9IHBpcGVsaW5lKCdhdXRvbWF0aWMtc3BlZWNoLXJlY29nbml0aW9uJywgY29uZmlnLm1vZGVsIHx8ICdYZW5vdmEvd2hpc3Blci10aW55LmVuJywge1xyXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NfY2FsbGJhY2s6IChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2UoeyB0eXBlOiAncHJvZ3Jlc3MnLCBkYXRhIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRyYW5zY3JpYmVyID0gYXdhaXQgcGlwZWxpbmVQcm9taXNlO1xyXG4gICAgICAgICAgICBwb3N0TWVzc2FnZSh7IHR5cGU6ICdzdGF0dXMnLCBzdGF0dXM6ICdyZWFkeScgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcG9zdE1lc3NhZ2UoeyB0eXBlOiAnc3RhdHVzJywgc3RhdHVzOiAncmVhZHknIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIHBvc3RNZXNzYWdlKHsgdHlwZTogJ2Vycm9yJywgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBwcm9jZXNzQXVkaW8oYXVkaW9EYXRhKSB7XHJcbiAgICBpZiAoIXRyYW5zY3JpYmVyKSB7XHJcbiAgICAgICAgcG9zdE1lc3NhZ2UoeyB0eXBlOiAnZXJyb3InLCBlcnJvcjogJ01vZGVsIG5vdCBpbml0aWFsaXplZCcgfSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgLy8gUnVuIHRyYW5zY3JpcHRpb25cclxuICAgICAgICAvLyBhdWRpb0RhdGEgc2hvdWxkIGJlIEZsb2F0MzJBcnJheVxyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyYW5zY3JpYmVyKGF1ZGlvRGF0YSwge1xyXG4gICAgICAgICAgICBjaHVua19sZW5ndGhfczogMzAsIC8vIERlZmF1bHQgZm9yIFdoaXNwZXJcclxuICAgICAgICAgICAgc3RyaWRlX2xlbmd0aF9zOiA1LFxyXG4gICAgICAgICAgICB0YXNrOiAndHJhbnNjcmliZScsXHJcbiAgICAgICAgICAgIHJldHVybl90aW1lc3RhbXBzOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zdCB0ZXh0ID0gcmVzdWx0LnRleHQgfHwgJyc7XHJcbiAgICAgICAgaWYgKHRleHQudHJpbSgpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcG9zdE1lc3NhZ2UoeyB0eXBlOiAncmVzdWx0JywgdHJhbnNjcmlwdDogdGV4dC50cmltKCksIGlzRmluYWw6IHRydWUgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgcG9zdE1lc3NhZ2UoeyB0eXBlOiAnZXJyb3InLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XHJcbiAgICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbInRyYW5zY3JpYmVyIiwicGlwZWxpbmVQcm9taXNlIiwic2VsZiIsIm9ubWVzc2FnZSIsImV2ZW50IiwidHlwZSIsImRhdGEiLCJpbml0aWFsaXplTW9kZWwiLCJwcm9jZXNzQXVkaW8iLCJjb25maWciLCJwaXBlbGluZSIsImVudiIsIm1vZHVsZSIsImUiLCJwb3N0TWVzc2FnZSIsImVycm9yIiwiYWxsb3dMb2NhbE1vZGVscyIsInVzZUJyb3dzZXJDYWNoZSIsInN0YXR1cyIsIm1vZGVsIiwicHJvZ3Jlc3NfY2FsbGJhY2siLCJlcnIiLCJtZXNzYWdlIiwiYXVkaW9EYXRhIiwicmVzdWx0IiwiY2h1bmtfbGVuZ3RoX3MiLCJzdHJpZGVfbGVuZ3RoX3MiLCJ0YXNrIiwicmV0dXJuX3RpbWVzdGFtcHMiLCJ0ZXh0IiwidHJpbSIsImxlbmd0aCIsInRyYW5zY3JpcHQiLCJpc0ZpbmFsIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/../src/workers/local-asr.worker.js\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/require chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "loaded", otherwise not loaded yet
/******/ 		var installedChunks = {
/******/ 			"crypto-fs-os-path-perf_hooks-url-util-worker_threads-_ssr_src_workers_local-asr_worker_js": 1
/******/ 		};
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		var installChunk = (chunk) => {
/******/ 			var moreModules = chunk.modules, chunkIds = chunk.ids, runtime = chunk.runtime;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			for(var i = 0; i < chunkIds.length; i++)
/******/ 				installedChunks[chunkIds[i]] = 1;
/******/ 		
/******/ 		};
/******/ 		
/******/ 		// require() chunk loading for javascript
/******/ 		__webpack_require__.f.require = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					installChunk(require("./" + __webpack_require__.u(chunkId)));
/******/ 				} else installedChunks[chunkId] = 1;
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		// no external install chunk
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("(ssr)/../src/workers/local-asr.worker.js");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;