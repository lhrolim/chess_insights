const moduleAlias = require("module-alias");
const path = require("path");
const fs = require("fs");

const isProduction = process.env.NODE_ENV === "production";

const aliases: any = {
  "@api": "../../api",
  "@util": "../../internal/util",
  "@internal": "../../internal",
  "@infra": "../../infra"
};

const resolvedAliases: any = {};

Object.keys(aliases).forEach(alias => {
  const aliasPath: any = aliases[alias];
  const resultPath = isProduction ? aliasPath.replace("./src", "build") : aliasPath;
  resolvedAliases[alias] = path.resolve(__dirname, aliasPath);
});

moduleAlias.addAliases(resolvedAliases);
