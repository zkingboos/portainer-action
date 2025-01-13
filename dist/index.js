/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 113:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 422:
/***/ ((module) => {

module.exports = eval("require")("axios");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
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
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const core = __nccwpck_require__(113);
const axios = __nccwpck_require__(422);

const apiVersion = "v1.41";

const pullImagesAction = async (
  http,
  token,
  nodeId,
  pullImages,
  registryId
) => {
  for (const pullImage of pullImages) {
    const endpoint = `/api/endpoints/${nodeId}/docker/${apiVersion}/images/create`;
    const encodedAPIAuth = registryId
      ? Buffer.from(
          JSON.stringify({
            registryId: parseInt(registryId),
          })
        ).toString("base64")
      : undefined;

    await http.post(endpoint, null, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": token,
        "X-Registry-Auth": encodedAPIAuth,
      },
      params: {
        fromImage: pullImage,
      },
    });

    core.info(`Image ${pullImage} pulled successfully`);
  }

  core.info("Images pulled successfully");
};

const singleStackAction = async (http, token, nodeId, stackId, action) => {
  const endpoint = `/api/stacks/${stackId}/${action}`;

  await http
    .post(endpoint, null, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": token,
      },
      params: {
        endpointId: nodeId,
      },
    })
    .catch((error) => {
      core.info(`Error: ${error.response.data.message}`);
    });

  core.info(`Stack ${action} successfully`);
};

const handleStackAction = async (http, token, nodeId, stacksId, action) => {
  for (const stackId of stacksId) {
    await singleStackAction(http, token, nodeId, stackId, action);
  }
};

const redeployStackAction = async (http, token, nodeId, stacksId) => {
  for (const stackId of stacksId) {
    await singleStackAction(http, token, nodeId, stackId, "stop");
    await singleStackAction(http, token, nodeId, stackId, "start");
  }
};

const main = async () => {
  const url = core.getInput("url");
  const token = core.getInput("token");
  const nodeId = core.getInput("node_id");
  const pullImages = core.getInput("pull_images")?.split(",")?.filter(Boolean);
  const registryId = core.getInput("registry_id");

  const startStack = core.getInput("start_stack")?.split(",")?.filter(Boolean);
  const stopStack = core.getInput("stop_stack")?.split(",")?.filter(Boolean);
  const redeployStack = core
    .getInput("redeploy_stack")
    ?.split(",")
    ?.filter(Boolean);

  const http = axios.create({
    baseURL: url,
  });

  if (pullImages?.length) {
    await pullImagesAction(http, token, nodeId, pullImages, registryId);
  }

  if (stopStack?.length) {
    await handleStackAction(http, token, nodeId, stopStack, "stop");
  }

  if (startStack?.length) {
    await handleStackAction(http, token, nodeId, startStack, "start");
  }

  if (redeployStack?.length) {
    await redeployStackAction(http, token, nodeId, redeployStack);
  }

  core.info("Action completed successfully");
};

main().catch((error) => core.setFailed(`Error: ${error.stack}`));

module.exports = __webpack_exports__;
/******/ })()
;