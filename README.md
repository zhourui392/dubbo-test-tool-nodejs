# Dubbo测试工具 - Node.js Web版本

一个基于Node.js的Dubbo接口测试工具，提供Web图形界面，支持三级分类管理（服务 > 接口 > 方法）、JSON参数输入、数据持久化和接口删除功能。

## 🚀 功能特点

- **Web图形界面**：现代化的浏览器操作界面
- **三级分类管理**：服务 > 接口 > 方法的层次结构
- **独立配置**：每个服务可以设置独立的Dubbo连接配置
- **JSON参数**：支持JSON格式的参数输入，类似Postman
- **数据持久化**：使用JSON文件保存所有配置和接口数据
- **删除功能**：支持删除接口和方法
- **实时测试**：Web界面支持实时接口调用和结果展示
- **真实Dubbo调用**：直接连接真实Dubbo服务进行测试

## 📦 安装依赖

```bash
npm install
```

## 🛠️ 使用方法

### 启动Web服务

```bash
npm start
```

然后访问：http://localhost:3000

### 环境变量配置

```bash
# 自定义端口
PORT=8080 npm start
```

## 📁 项目结构

```
dubbo-test-tool-nodejs/
├── package.json              # 项目配置和依赖
├── demo-interfaces.json      # 示例数据
├── interfaces.json           # 数据文件（自动生成）
├── src/
│   ├── web-server.js        # Web服务器主程序
│   ├── core/
│   │   ├── data-manager.js  # 数据管理核心
│   │   └── dubbo-client.js  # Dubbo客户端实现
│   └── public/
│       └── index.html       # Web界面
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
- **服务树形导航**：展示所有服务、接口和方法
- **折叠/展开**：支持服务和接口的折叠展开

### 接口和方法管理
- **删除接口**：在接口名称旁点击"🗑️"按钮删除整个接口
- **删除方法**：在方法名称旁点击"🗑️"按钮删除单个方法
- **方法选择**：点击方法名称选择要测试的方法

### 接口测试面板
- **参数编辑器**：JSON格式参数编辑，支持语法高亮
- **一键测试**：点击"🧪 测试接口"按钮执行调用
- **实时结果展示**：JSON格式化显示响应结果
- **错误信息显示**：网络错误和调用错误的详细提示

## 📊 示例数据

项目包含 `demo-interfaces.json` 示例数据，包含以下O2O业务服务：

### 用户服务 (UserService) - 端口20880
- **用户管理接口**：获取用户信息、更新用户、创建用户
- **认证接口**：用户登录、退出登录

### 订单服务 (OrderService) - 端口20881
- **订单管理接口**：创建订单、获取订单、更新订单状态、取消订单

### 支付服务 (PaymentService) - 端口20882
- **支付处理接口**：创建支付、处理支付、退款处理

使用示例数据：
```bash
cp demo-interfaces.json interfaces.json
```

## 🔌 API接口

Web服务器提供以下REST API：

### 服务管理
- `GET /api/services` - 获取所有服务
- `POST /api/services` - 添加新服务
- `DELETE /api/services/:serviceId` - 删除服务

### 接口管理
- `POST /api/services/:serviceId/interfaces` - 添加接口
- `DELETE /api/services/:serviceId/interfaces/:interfaceId` - 删除接口

### 方法管理
- `POST /api/services/:serviceId/interfaces/:interfaceId/methods` - 添加方法
- `DELETE /api/services/:serviceId/interfaces/:interfaceId/methods/:methodId` - 删除方法

### 测试调用
- `POST /api/test-method` - 测试方法调用

## 🚦 技术实现

### Dubbo客户端
- **真实连接**：直接通过TCP Socket连接Dubbo服务
- **协议支持**：实现简化版Dubbo协议（建议生产环境使用成熟库）
- **错误处理**：完善的连接超时和错误处理机制
- **参数解析**：支持JSON格式参数自动转换

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

## 📄 许可证

MIT License

## 🔗 相关链接

- [原Python版本](../dubbo-test-tool/)
- [Dubbo官方文档](https://dubbo.apache.org/)
- [Node.js Dubbo客户端库](https://www.npmjs.com/search?q=dubbo)