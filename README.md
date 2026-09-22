# AgentTeam · 多智能体协作完成毕业设计

ICT 大赛云赛道赛题 1.12：基于华为云码道 CodeArts Agent Space 的 Agent Team 多智能体协作，一条指令按「需求→设计→开发→论文→答辩」完成毕业设计全流程。

## 课题：在线考试系统（全栈 Web）

本仓库是 Agent Team 协作产出的完整毕业设计项目，7 角色（需求分析师、系统架构师、前端/后端开发者、测试工程师、论文撰写者、答辩助手）按五阶段骨架产出全部交付物。

## 五阶段产出

| 阶段 | 产出 | 位置 |
|------|------|------|
| Phase 1 需求 | 需求规格说明书、用例图、需求追踪矩阵 | requirements/ |
| Phase 2 设计 | 系统设计文档、架构图、ER图、API契约、DDL | design/ |
| Phase 3 开发 | 前端（Vue 风格单页）+ 后端（Express 风格 API） | frontend/ backend/ |
| Phase 3 测试 | 测试报告（10 用例全通过） | docs/test-report.md |
| Phase 4 论文 | 6 章毕业论文 | thesis/毕业论文.md |
| Phase 5 答辩 | 答辩 PPT 大纲、演示脚本、预测 Q&A | defense/ |

## 运行

```bash
node backend/server.mjs        # 启动 API（http://127.0.0.1:3000）
# 打开 frontend/index.html 即可体验 登录→考试→交卷→统计
```

## Agent Team 协作要点
- 角色单一化、能力匹配、权限最小化；
- 骨架固定（五阶段），内容由团队根据方向自适应生成；
- 需求/设计/开发/论文/答辩全链路无人工编码，只发一条指令。
