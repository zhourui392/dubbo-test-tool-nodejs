# Dubbo接口调用故障排除指南

## 🚨 常见问题及解决方案

### 1. 请求超时问题

#### 症状
- 界面显示"请求超时"
- 控制台显示"[Dubbo调用] 请求超时"

#### 可能原因和解决方案

**A. 网络连接问题**
```bash
# 使用telnet测试端口连通性
telnet <dubbo_host> <dubbo_port>

# 或使用nc命令
nc -zv <dubbo_host> <dubbo_port>
```

**B. Dubbo服务未启动**
- 检查目标Dubbo服务是否正在运行
- 确认服务监听的端口是否正确
- 查看服务端日志确认无错误

**C. 超时时间设置过短**
- 增加超时时间配置（建议10000ms以上）
- 在服务配置中修改"超时时间"字段

**D. 防火墙阻断**
- 检查客户端和服务端防火墙设置
- 确保目标端口已开放

### 2. 连接被拒绝

#### 症状
- "连接被拒绝，请检查服务是否启动"
- 错误代码：ECONNREFUSED

#### 解决方案
1. **确认服务状态**
   ```bash
   # 检查端口是否被监听
   netstat -an | grep <port>
   # 或
   ss -ln | grep <port>
   ```

2. **验证服务地址**
   - 确认IP地址正确（本地服务用127.0.0.1或localhost）
   - 确认端口号与Dubbo服务配置一致

3. **检查服务配置**
   - Dubbo服务的监听地址是否正确
   - 是否绑定到正确的网络接口

### 3. 协议不兼容

#### 症状
- 连接成功但无响应
- 服务端接收到请求但无法解析

#### 说明
本工具使用简化版Dubbo协议实现，可能与某些Dubbo版本不完全兼容。

#### 解决方案
1. **使用连接测试功能**
   - 点击服务旁的🔍按钮测试TCP连接
   - 验证网络层连通性

2. **检查Dubbo版本兼容性**
   - 建议使用Dubbo 2.6+版本
   - 确认服务端支持标准Dubbo协议

3. **考虑使用标准客户端**
   - 生产环境推荐使用成熟的Dubbo Node.js客户端
   - 如：node-dubbo、dubbo2.js等

### 4. 参数格式错误

#### 症状
- "参数JSON格式错误"
- 接口调用失败

#### 解决方案
1. **验证JSON格式**
   ```json
   // 正确格式示例
   {"userId": "123", "userName": "test"}
   
   // 数组参数
   ["param1", "param2", "param3"]
   
   // 嵌套对象
   {
     "user": {"id": 1, "name": "test"},
     "options": {"timeout": 5000}
   }
   ```

2. **使用JSON验证工具**
   - 使用在线JSON验证器检查格式
   - 确保引号、括号匹配

### 5. 服务发现问题

#### 症状
- 无法找到指定接口或方法
- "未找到指定的服务/接口/方法"

#### 解决方案
1. **确认接口名称**
   - 使用完整的接口类名（包含包名）
   - 例：`com.example.service.UserService`

2. **确认方法名称**
   - 使用准确的方法名（区分大小写）
   - 检查方法签名是否正确

## 🔧 调试技巧

### 1. 使用连接测试
每个服务配置旁都有🔍按钮，可以快速测试TCP连接：
- ✅ 连接成功：网络层通信正常
- ❌ 连接失败：检查网络和服务状态

### 2. 查看控制台日志
服务端控制台会显示详细的调试信息：
```bash
[Dubbo调用] 开始调用 com.example.UserService.getUserInfo
[Dubbo调用] 连接地址: 127.0.0.1:20880
[Dubbo调用] 超时设置: 5000ms
[Dubbo调用] TCP连接已建立
[Dubbo调用] 请求已发送
```

### 3. 网络诊断命令
```bash
# Windows
ping <host>
telnet <host> <port>

# Linux/macOS
ping <host>
nc -zv <host> <port>
nmap -p <port> <host>
```

## 🎯 最佳实践

### 1. 超时设置
- 局域网环境：3000-5000ms
- 广域网环境：10000-15000ms
- 复杂业务接口：20000ms+

### 2. 错误重试
- 网络不稳定时可多次尝试
- 检查每次失败的具体错误信息
- 根据错误类型采取相应措施

### 3. 环境隔离
- 开发环境使用本地Dubbo服务
- 测试环境使用独立的服务实例
- 避免直接连接生产环境

## 📞 获取帮助

如果以上方案都无法解决问题：

1. **收集信息**
   - 错误信息截图
   - 控制台日志
   - 网络环境描述
   - Dubbo服务版本

2. **检查文档**
   - Dubbo官方文档
   - 服务提供方接口文档
   - 网络配置文档

3. **联系支持**
   - 向Dubbo服务维护团队咨询
   - 在项目issue中提交问题
   - 寻求技术支持