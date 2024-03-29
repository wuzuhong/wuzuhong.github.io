# 【认证、授权和鉴权】OAuth 2.0
## OAuth2 是什么

#### 核心概念
OAuth 2.0 是一个认证和授权协议，它允许软件应用代表（而不是充当）资源拥有者去访问资源拥有者的资源。

#### 常见示例
对于有泊车钥匙的车来说，把泊车钥匙交给泊车员比直接交出常规钥匙更安全。泊车钥匙限制泊车员只能操作点火开关和车门，而不能打开后备箱和手套箱。更高级的泊车钥匙还能限制最高车速，甚至能在车辆行使超过车主设定的距离后强制停车并向车主发出警报。同样的道理，OAuth令牌可以限制客户端只能执行资源拥有者授权的操作。

对于使用了一个照片云存储服务和一个云打印服务，并且想使用云打印服务来打印存放在云存储服务上的照片。很幸运，这两个服务能够使用 API来通信。这很好，但两个服务由不同的公司提供，这意味着你在云存储服务上的账户和在云打印服务上的账户没有关联。使用 OAuth 可以解决这个问题：授权云打印服务访问照片，但并不需要将存储服务上的账户密码交给它。

## OAuth2 中的角色

### 客户端
客户端是代表资源拥有者访问受保护资源的软件，它使用 OAuth 来获取访问权限。得益于 OAuth 的设计，客户端通常是 OAuth 系统中最简单的组件，它的职责主要是从授权服务器获取令牌以及在受保护资源上使用令牌。客户端不需要理解令牌，也不需要查看令牌的内容。相反，客户端只需要将令牌视为一个不透明的字符串可。OAuth 客户端可以是 Web 应用、原生应用，甚至浏览器内的 JavaScript 应用。

#### 受保护资源
受保护资源能够通过 HTTP 服务器进行访问，在访问时需要 OAuth 访问令牌。受保护资源需要验证收到的令牌，并决定是否响应以及如何响应请求。在 OAuth 架构中，受保护资源对是否认可令牌拥有最终决定权。

#### 资源拥有者
资源拥有者是有权将访问权限授权给客户端的主体。与 OAuth 系统中的其他组件不同，资源拥有者不是软件。在大多数情况下，资源拥有者是一个人，他使用客户端软件访问受他控制的资源。至少在部分过程中，资源拥有者要使用 Web 浏览器（通常称为用户代理）与授权服务器交互。资源拥有者可能还会使用浏览器与客户端交互，如这里所展示的，但这完全取决于客户端性质。

#### 授权服务器
授权服务器是一个 HTTP 服务器，它在 OAuth系统中充当中央组件。授权服务器对资源拥有者和客户端进行身份认证，让资源拥有者向客户端授权、为客户端颁发令牌。某些授权服务器还会提供额外的功能，例如令牌内省、记忆授权决策。

## OAuth2 许可类型及其适用场景

#### 授权码许可类型
适用于 Web 应用

#### 隐式许可类型
适用于浏览器内的 JavaScript 应用

#### 客户端凭据许可类型

#### 资源拥有者凭据许可类型

#### 断言许可类型

## 授权码许可类型的完整流程

1. 首先，当客户端发现需要获取一个新的 OAuth 访问令牌时，它会将资源拥有者重定向至授权服务器，并附带一个授权请求，表示它要向资源拥有者请求一些权限。
```
HTTP/1.0 302 Moved Temporarily
x-powered-by: Express
Location: http://localhost:9001/authorize?response_type=code&scope=foo&client_id=xx&redirect_uri=http://localhost:9000/callback&state=xx
Vary: Accept
Content-Type: text/html; charset=utf-8
Content-Length: 444
Date: Fri, 31 Jul 2022 20:50:19 GMT
Connection: keep-alive
```
2. 然后，授权服务器会要求用户进行身份认证。这一步对确认资源拥有者的身份以及能向客户端授予哪些权限来说至关重要。用户身份认证直接在用户（和用户的浏览器）与授权服务器之间进行，这个过程对客户端应用不可见。这一重要特性避免了用户将自己的凭据透露给客户端应用。
3. 然后，用户向客户端应用授权。在这一步，资源拥有者选择将一部分权限授予客户端应用，授权服务器提供了许多不同的选项来实现这一点。客户端可以在授权请求中指明其想要获得哪些权限（称为 OAuth 权限范围）。授权服务器可以允许用户拒绝一部分或者全部权限范围，也可以让用户批准或者拒绝整个授权请求。
4. 然后，授权服务器将用户重定向回客户端应用。这一步采用 HTTP重定向的方式，回到客户端的 redirect_uri 。
```
HTTP/1.1 302 Found
Location: http://localhost:9000/callback?code=xx&state=xx
```
5. 然后，客户端通过一个POST请求将授权码发送给授权服务器，在 HTTP主体中以表单格式传递参数，并在 HTTP 基本认证头部中设置 client_id 和 client_secret。这个 HTTP 请求由客户端的后端直接发送给授权服务器，浏览器或者资源拥有者不参与此过程。这样保证了客户端能够直接进行身份认证，让其他组件无法查看或者操作令牌请求。
```
POST /token
Host: localhost:9001
Accept: application/json
Content-type: application/x-www-form-encoded
Authorization: Basic xxxxxx

grant_type=authorization_code&redirect_uri=http://localhost:9000/callback&code=xx
```
6. 然后，授权服务器接收该请求，如果请求有效，则颁发令牌。授权服务器需要执行多个步骤以确保请求是合法的。首先，它要验证客户端凭据（通过 Authorization 头部传递）以确定是哪个客户端请求授权。然后，从请求主体中读取 code 参数的值，并从中获取关于该授权码的信息，包括发起初始授权请求的是哪个客户端，执行授权的是哪个用户，授权的内容是什么。如果授权码有效且尚未使用过，而且发起该请求的客户端与最初发起授权请求的客户端相同，则授权服务器会生成一个新的访问令牌并返回给客户端。该令牌以 JSON对象的格式通过 HTTP响应返回给客户端。
```
HTTP 200 OK
Date: Fri, 31 Jul 2022 21:19:03 GMT
Content-type: application/json
{
"access_token": "xxxxxxxxxx",
"token_type": "Bearer"
"refresh_token": "xxxxxxxx"
}
```
7. 然后，客户端可以解析令牌响应并从中获取令牌的值来访问受保护资源。令牌响应中还可以包含一个刷新令牌（用于获取新的访问令牌而不必重新请求授权），以及一些关于访问令牌的附加信息，比如令牌的权限范围和过期时间（刷新令牌的过期时间必须比令牌的过期时间要长，刷新令牌在刷新令牌的时候也会刷新自己，刷新的过程其实就是换一个新的，重置过期时间）。客户端可以将访问令牌存储在一个安全的地方，以便以后在用户不在场时也能够随时使用。客户端出示令牌的方式有多种，推荐使用 Authorization 头部。
```
GET /resource HTTP/1.1
Host: localhost:9002
Accept: application/json
Connection: keep-alive
Authorization: Bearer xxxxxx
```

8. 最后，受保护资源可以从头部中解析出令牌，判断它是否有效，从中得知授权者是谁以及授权内容，并返回响应。

#### 自定义登录页
* 自定义授权服务的登录页：通过环境变量来指定登录页路径
* 自定义客户端的登录页：不使用授权服务的登录页，而使用客户端自己的登录页，怎么做？

#### 令牌和刷新令牌的存储方式
* 以jwt的格式存储在cookie中？
* 以jwt的格式存储在header中？
