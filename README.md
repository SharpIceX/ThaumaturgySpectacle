<!-- markdownlint-disable MD033 MD041 -->

> [!NOTE]
> **构建提示**
> 构建本项目请确保能够连接到 NPM 仓库和 GitHub

<div align="center">
    🔒很抱歉我不接受贡献，但欢迎提出建议！如果你有任何想法或改进建议，欢迎通过 Issuse 与我联系。🙏
</div>
<br />
<div align="center">
    <img href="https://codetime.dev" alt="CodeTime Badge" src="https://shields.jannchie.com/endpoint?style=for-the-badge&color=&url=https%3A%2F%2Fapi.codetime.dev%2Fv3%2Fusers%2Fshield%3Fuid%3D27298%26project%3DThaumaturgySpectacle">
</div>

## 许可证

幻术奇象 Project 整体采用 Mozilla Public License 2.0 许可协议，部分目录或文件可能另有不同的许可证声明。

## 初始开发/构建环境

## 依赖

- Node.js 22.22+
- pnpm 10.28+

```bash
# 拉取仓库
git clone https://github.com/SharpIceX/ThaumaturgySpectacle.git

cd ThaumaturgySpectacle

# 安装依赖
pnpm install --frozen-lockfile
```

### 构建项目

```bash
# 构建网站
pnpm --dir ./project/website run generate
```
