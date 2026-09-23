// ============================================================================
// FlClash 覆写脚本：把「你自己的稳定地址」上的去广告规则集合并进配置。
//
// 用法：
//   FlClash → 进阶配置 → 脚本（覆写脚本）→ 粘贴以下内容 → 保存 → 重新连接。
//
// 前置：先把本仓库推到 GitHub 并让 Actions 跑通，
//       然后把下面 OWNER/REPO 换成你的 GitHub 用户名 / 仓库名。
//
// 规则集地址形如：
//   https://github.com/OWNER/REPO/releases/download/ruleset/adblock.mrs
//   固定 tag(ruleset) + 固定文件名(adblock.mrs) => URL 永久不变，
//   上游怎么改名/换路径都影响不到你。
// ============================================================================

function main(config) {
  const BASE = "https://github.com/OWNER/REPO/releases/download/ruleset";

  // 1) 注册规则集提供者（本地缓存见 path）
  config["rule-providers"] = config["rule-providers"] || {};
  config["rule-providers"]["my-adblock"] = {
    type: "http",
    behavior: "domain",     // 纯域名匹配
    format: "mrs",          // mihomo 二进制格式，加载快、体积小
    url: BASE + "/adblock.mrs",
    path: "./ruleset/my-adblock.mrs",
    interval: 21600,        // 每 6 小时拉一次更新
  };

  // 2) 加入 REJECT 规则，务必插到最前面
  config["rules"] = config["rules"] || [];
  config["rules"].unshift("RULE-SET,my-adblock,REJECT");

  return config;
}
