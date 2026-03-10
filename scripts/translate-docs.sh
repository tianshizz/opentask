#!/bin/bash

# Script to translate Chinese to English in all documentation files
echo "🌍 Translating documentation from Chinese to English..."

# Find all markdown and TypeScript files (excluding node_modules)
find . -type f \( -name "*.md" -o -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -exec sed -i '' \
    -e 's/仪表盘/Dashboard/g' \
    -e 's/总览/Overview/g' \
    -e 's/加载中\.\.\./Loading.../g' \
    -e 's/加载中/Loading/g' \
    -e 's/创建于/Created/g' \
    -e 's/更新于/Updated/g' \
    -e 's/所有/All/g' \
    -e 's/待处理/Pending/g' \
    -e 's/进行中/In Progress/g' \
    -e 's/已完成/Completed/g' \
    -e 's/等待审核/Awaiting Review/g' \
    -e 's/暂无/No/g' \
    -e 's/查看全部/View All/g' \
    -e 's/立即查看/View Now/g' \
    -e 's/次尝试/attempts/g' \
    -e 's/条评论/comments/g' \
    -e 's/工单/tickets/g' \
    -e 's/概述/Overview/g' \
    -e 's/快速开始/Quick Start/g' \
    -e 's/安装/Installation/g' \
    -e 's/配置/Configuration/g' \
    -e 's/使用/Usage/g' \
    -e 's/示例/Example/g' \
    -e 's/前置要求/Prerequisites/g' \
    -e 's/步骤/Step/g' \
    -e 's/注意/Note/g' \
    -e 's/警告/Warning/g' \
    -e 's/错误/Error/g' \
    -e 's/成功/Success/g' \
    -e 's/失败/Failed/g' \
    -e 's/文档/Documentation/g' \
    -e 's/指南/Guide/g' \
    -e 's/教程/Tutorial/g' \
    -e 's/参考/Reference/g' \
    -e 's/架构/Architecture/g' \
    -e 's/功能/Features/g' \
    -e 's/特性/Features/g' \
    -e 's/实现/Implementation/g' \
    -e 's/总结/Summary/g' \
    -e 's/完成/Complete/g' \
    -e 's/状态/Status/g' \
    -e 's/路线图/Roadmap/g' \
    -e 's/计划/Plan/g' \
    -e 's/阶段/Phase/g' \
    -e 's/测试/Test/g' \
    -e 's/单元测试/Unit Test/g' \
    -e 's/集成测试/Integration Test/g' \
    -e 's/故障排除/Troubleshooting/g' \
    -e 's/问题/Issue/g' \
    -e 's/解决方案/Solution/g' \
    -e 's/修复/Fix/g' \
    -e 's/更新/Update/g' \
    -e 's/版本/Version/g' \
    -e 's/开发/Development/g' \
    -e 's/生产/Production/g' \
    -e 's/环境/Environment/g' \
    -e 's/变量/Variable/g' \
    -e 's/数据库/Database/g' \
    -e 's/缓存/Cache/g' \
    -e 's/队列/Queue/g' \
    -e 's/存储/Storage/g' \
    -e 's/服务/Service/g' \
    -e 's/接口/Interface/g' \
    -e 's/模型/Model/g' \
    -e 's/控制器/Controller/g' \
    -e 's/路由/Route/g' \
    -e 's/中间件/Middleware/g' \
    -e 's/验证/Validation/g' \
    -e 's/授权/Authorization/g' \
    -e 's/认证/Authentication/g' \
    -e 's/用户/User/g' \
    -e 's/管理员/Admin/g' \
    -e 's/权限/Permission/g' \
    -e 's/角色/Role/g' \
  {} +

echo "✅ Translation complete!"
echo "Note: This is an automatic translation. Please review the changes for accuracy."
