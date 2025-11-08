import * as cdk from "aws-cdk-lib";

export const DefinedResourceIdentifiers = Object.freeze({
  MODULES_LAYER_01: "MODULES-LAYER-01-VXkxz6aFnD",
  MODULES_LAYER_02: "MODULES-LAYER-02-CcR5T72xuJ",
  EXTENSION_LAYER: "EXTENSION-LAYER-PwvpbDEBC6",
});

export function getModuleLayer_01__Resource() {
  return cdk.Fn.importValue(DefinedResourceIdentifiers.MODULES_LAYER_01);
}

export function getModuleLayer_02__Resource() {
  return cdk.Fn.importValue(DefinedResourceIdentifiers.MODULES_LAYER_02);
}

export function getExtensionLayer__Resource() {
  return cdk.Fn.importValue(DefinedResourceIdentifiers.EXTENSION_LAYER);
}
