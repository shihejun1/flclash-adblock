// ============================================================================
// FlClash 覆写脚本（诊断版）：合并去广告规则集 + 内置金丝雀，用来定位问题。
//
// 用法：FlClash → 进阶配置 → 脚本 → 覆盖这段内容 → 保存 → 勾选启用
//       → 【关键】去「配置」页，对订阅做一次「更新/刷新」，再回仪表盘重连。
//
// 稳定地址（原始，永久不变）：
//   https://github.com/shihejun1/flclash-adblock/releases/download/ruleset/adblock.txt
// 因手机直连 github 常超时，这里走代理镜像下载。
// ============================================================================

function main(config) {
  // GitHub 代理镜像（始终指向最新 Release）。镜像失效就换成下面任一：
  //   https://ghfast.top/https://github.com/...   https://ghproxy.net/https://github.com/...
  const BASE = "https://gh-proxy.com/https://github.com/shihejun1/flclash-adblock/releases/download/ruleset";

  // 1) 规则集提供者。改用 text 格式（所有 mihomo 版本都支持，排除 .mrs 兼容问题）；
  //    path 换新文件名，强制这次重新下载，不吃旧缓存。
  config["rule-providers"] = config["rule-providers"] || {};
  config["rule-providers"]["my-adblock"] = {
    type: "http",
    behavior: "domain",
    format: "text",
    url: BASE + "/adblock.txt",
    path: "./ruleset/my-adblock-v2.txt",
    interval: 21600,
  };

  // 2) 规则。两条都插到最前面：
  config["rules"] = config["rules"] || [];
  //    (a) 规则集 REJECT —— 真正的去广告
  config["rules"].unshift("RULE-SET,my-adblock,REJECT");
  //    (b) 金丝雀：不依赖规则集，直接拦 doubleclick.net。
  //        用来判断这段脚本到底有没有被应用到运行配置里。
  config["rules"].unshift("DOMAIN-SUFFIX,doubleclick.net,REJECT");

  return config;
}
