# Dubbo测试工具 - Node.js Web版本

一个基于Node.js的Dubbo接口测试工具，提供Web图形界面，支持三级分类管理（服务 > 接口 > 方法）、JSON参数输入、数据持久化和接口删除功能。

## 🚀 功能特点

- **Web图形界面**：现代化的浏览器操作界面
- **三级分类管理**：服务 > 接口 > 方法的层次结构
- **独立配置**：每个服务可以设置独立的Dubbo连接配置
- **JSON参数**：支持JSON格式的参数输入，类似Postman
- **数据持久化**：使用JSON文件保存所有配置和接口数据
- **CRUD操作**：支持服务、接口、方法的完整增删改查
- **折叠树形结构**：支持服务和接口列表的折叠/展开，状态自动保存
- **实时测试**：Web界面支持实时接口调用和结果展示
- **真实Dubbo调用**：直接连接真实Dubbo服务进行测试

## 📦 安装依赖

```bash
npm install
```

## 🛠️ 使用方法

### 快速启动（推荐）

#### Windows用户
双击运行 `start.bat` 文件，或在命令行中执行：
```cmd
start.bat
```

#### Linux/macOS用户
在终端中执行：
```bash
./start.sh
```

**启动选项：**
1. **仅启动Web服务**：需要连接真实的Dubbo服务
2. **Web服务 + 模拟Dubbo服务**：自动启动模拟服务，无需真实Dubbo环境

**启动脚本功能：**
- 🔍 自动检测Node.js环境
- 📦 首次运行时自动安装依赖
- 📋 自动加载示例数据（如果存在）
- 🎭 可选启动模拟Dubbo服务
- 🚀 一键启动Web服务
- 💡 显示详细的访问信息和使用提示

### 手动启动

#### 安装依赖
```bash
npm install
```

#### 启动Web服务

```bash
npm start
```

然后访问：http://localhost:3000

### 开发模式启动

```bash
npm run dev  # 使用nodemon自动重启
```

### 模拟服务启动

```bash
# 启动单个模拟Dubbo服务
npm run mock-server

# 启动多个模拟服务 (端口20880,20881,20882)
npm run mock-multi

# 同时启动Web服务和模拟服务
npm run dev-with-mock
```

### 环境变量配置

```bash
# 自定义端口
PORT=8080 npm start

# Windows
set PORT=8080 && npm start
```

## 📁 项目结构

```
dubbo-test-tool-nodejs/
├── package.json              # 项目配置和依赖
├── start.bat                 # Windows一键启动脚本
├── start.sh                  # Linux/macOS一键启动脚本
├── demo-interfaces.json      # 示例数据
├── interfaces.json           # 数据文件（自动生成）
├── src/
│   ├── web-server.js        # Web服务器主程序
│   ├── mock-dubbo-server.js # 模拟Dubbo服务器
│   ├── core/
│   │   ├── data-manager.js  # 数据管理核心
│   │   └── dubbo-client.js  # Dubbo客户端实现
│   └── public/
│       └── index.html       # Web界面
├── QUICKSTART.md           # 快速使用指南
├── TROUBLESHOOTING.md      # 故障排除指南
└── README.md               # 说明文档
```

## 🔧 配置说明

### 服务配置
每个服务支持以下Dubbo配置：
- **主机地址**（默认：127.0.0.1）
- **端口号**（默认：20880）
- **超时时间**（默认：5000ms）
- **版本号**（可选）
- **分组**（可选）

### 数据存储
所有数据保存在 `interfaces.json` 文件中，包括：
- 服务配置和Dubbo连接信息
- 接口和方法信息
- JSON参数模板

## 🌐 Web界面功能

### 服务管理
- **添加服务**：点击"➕ 添加服务"按钮创建新服务
- **编辑服务**：点击服务旁的"✏️"按钮修改服务配置
- **删除服务**：点击服务旁的"🗑️"按钮删除整个服务
- **服务树形导航**：展示所有服务、接口和方法的层次结构
- **折叠/展开**：点击 ▶/▼ 图标折叠或展开服务和接口列表
- **状态持久化**：折叠状态自动保存到本地存储，刷新后恢复

### 接口和方法管理
- **添加接口**：点击服务旁的"➕"按钮添加新接口
- **编辑接口**：点击接口旁的"✏️"按钮修改接口名称
- **删除接口**：点击接口旁的"🗑️"按钮删除整个接口
- **添加方法**：点击接口旁的"➕"按钮添加新方法
- **编辑方法**：点击方法旁的"✏️"按钮修改方法信息
- **删除方法**：点击方法旁的"🗑️"按钮删除单个方法
- **方法选择**：点击方法名称选择要测试的方法

### 接口测试面板
- **参数编辑器**：JSON格式参数编辑，支持语法高亮
- **一键测试**：点击"🧪 测试接口"按钮执行调用
- **连接测试**：点击"🔍"按钮测试TCP连接状态
- **实时结果展示**：JSON格式化显示响应结果
- **错误信息显示**：网络错误和调用错误的详细提示
- **调试信息**：服务端控制台显示详细的调用日志

## 📊 示例数据

项目包含 `demo-interfaces.json` 示例数据，包含以下O2O业务服务：

### 用户服务 (UserService) - 端口20880
- **用户管理接口**：获取用户信息、更新用户、创建用户
- **认证接口**：用户登录、退出登录

### 订单服务 (OrderService) - 端口20881
- **订单管理接口**：创建订单、获取订单、更新订单状态、取消订单

### 支付服务 (PaymentService) - 端口20882
- **支付处理接口**：创建支付、处理支付、退款处理

### 使用示例数据

**自动加载（推荐）：**
```bash
# 启动脚本会自动处理示例数据
start.bat          # Windows
./start.sh          # Linux/macOS
```

**手动复制：**
```bash
cp demo-interfaces.json interfaces.json        # Linux/macOS
copy demo-interfaces.json interfaces.json      # Windows
```

## 🎭 模拟Dubbo服务

为了解决"没有真实Dubbo服务"的问题，项目提供了内置的模拟Dubbo服务：

### 功能特点
- **完全兼容**：实现标准Dubbo协议，与测试工具完美配合
- **智能响应**：根据接口和方法返回相应的模拟数据
- **多端口支持**：可同时在多个端口运行
- **详细日志**：显示完整的请求响应过程

### 启动方式
```bash
# 方式1: 使用启动脚本（推荐）
start.bat           # Windows - 选择选项2
./start.sh          # Linux/macOS - 选择选项2

# 方式2: 手动启动
npm run mock-server              # 单个服务(20880)
npm run mock-multi               # 多个服务(20880,20881,20882)
npm run dev-with-mock           # Web服务+模拟服务
```

### 模拟数据示例
模拟服务会根据调用的接口方法返回相应的示例数据：

```json
// getUserInfo响应示例
{
  "success": true,
  "data": {
    "userId": "123456",
    "name": "张三", 
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "createTime": "2024-01-01T00:00:00Z",
    "status": "ACTIVE"
  },
  "message": "获取用户信息成功"
}
```

## 🔌 API接口

Web服务器提供以下REST API：

### 服务管理
- `GET /api/services` - 获取所有服务
- `POST /api/services` - 添加新服务
- `PUT /api/services/:serviceId` - 更新服务配置
- `DELETE /api/services/:serviceId` - 删除服务

### 接口管理
- `POST /api/services/:serviceId/interfaces` - 添加接口
- `PUT /api/services/:serviceId/interfaces/:interfaceId` - 更新接口
- `DELETE /api/services/:serviceId/interfaces/:interfaceId` - 删除接口

### 方法管理
- `POST /api/services/:serviceId/interfaces/:interfaceId/methods` - 添加方法
- `PUT /api/services/:serviceId/interfaces/:interfaceId/methods/:methodId` - 更新方法
- `DELETE /api/services/:serviceId/interfaces/:interfaceId/methods/:methodId` - 删除方法

### 测试调用
- `POST /api/test-method` - 测试方法调用
- `POST /api/test-connection` - 测试服务连接

## 🚦 技术实现

### Dubbo客户端
- **真实连接**：直接通过TCP Socket连接Dubbo服务
- **协议支持**：实现简化版Dubbo协议（建议生产环境使用成熟库）
- **错误处理**：完善的连接超时和错误处理机制
- **参数解析**：支持JSON格式参数自动转换
- **连接诊断**：提供TCP连接测试功能
- **调试日志**：详细的调用过程日志记录

### Web服务器
- **Express.js**：RESTful API服务
- **Socket.IO**：实时通信支持
- **静态文件服务**：内置Web界面托管
- **CORS支持**：跨域请求处理

### 前端界面
- **原生JavaScript**：无框架依赖，轻量级实现
- **响应式设计**：支持桌面和移动设备
- **实时更新**：WebSocket实时数据同步
- **现代UI**：Material Design风格界面
- **交互体验**：支持树形结构折叠展开，状态持久化
- **本地存储**：使用localStorage保存用户界面偏好设置

## 📋 技术栈

- **Node.js** - 运行时环境
- **Express.js** - Web服务器框架
- **Socket.IO** - 实时通信
- **UUID** - 唯一标识符生成
- **Lodash** - 工具函数库

## 🚀 部署说明

### 开发环境
```bash
npm run dev  # 使用nodemon自动重启
```

### 生产环境
```bash
npm start    # 直接启动服务

# 或使用启动脚本
start.bat    # Windows
./start.sh   # Linux/macOS
```

### Docker部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 扩展建议

### Dubbo客户端增强
- 集成成熟的Node.js Dubbo客户端库
- 支持Hessian2序列化
- 添加注册中心支持（Zookeeper、Nacos）
- 完善错误处理和重试机制

### 功能扩展
- 批量接口测试
- 测试结果历史记录
- 接口文档生成
- 环境配置管理
- 用户权限管理
- 导入/导出配置功能
- 接口性能监控
- 自动化测试脚本

## 🆘 故障排除

### 常见问题
遇到连接超时、调用失败等问题时，请参考详细的故障排除指南：
- 📖 [故障排除指南](TROUBLESHOOTING.md)
- 🔍 使用连接测试功能诊断网络问题
- 📋 查看服务端控制台的详细调试日志

### 快速诊断
1. **连接测试**：点击服务旁的🔍按钮测试TCP连接
2. **检查日志**：观察服务端控制台的调试信息
3. **验证配置**：确认服务地址、端口、超时设置
4. **网络检查**：使用telnet或nc命令测试端口连通性

### 协议兼容性
本工具使用简化版Dubbo协议，可能与某些版本不完全兼容。生产环境建议使用成熟的Node.js Dubbo客户端库。

## 📄 许可证

MIT License

## 🔗 相关链接

- [原Python版本](../dubbo-test-tool/)
- [Dubbo官方文档](https://dubbo.apache.org/)
- [Node.js Dubbo客户端库](https://www.npmjs.com/search?q=dubbo)