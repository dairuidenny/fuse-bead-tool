class ChangelogManager {
    constructor() {
        this.currentVersion = '1.0.1';
        this.lastShownDate = localStorage.getItem('lastShownChangelogDate');
        // 直接在代码中存储更新日志
        this.changelogs = {
            '1.0.1': `# 版本 1.0.1 (2024-03-21)

## 新增功能
- 添加套盒模式，支持多个套盒同时选择
- 新增黄豆豆品牌的三个基础套装（HDD1/HDD2/HDD3）
- 添加更新日志系统，每天首次访问时显示
- 添加更新日志查看按钮

## 优化改进
- 优化颜色匹配算法，提高颜色识别准确度
- 改进界面响应速度
- 优化套盒选择界面，支持多选
- 优化镜像功能的实现

## 问题修复
- 修复颜色替换后无法正确显示的问题
- 修复部分颜色代码大小写不一致导致的匹配错误
- 修复镜像功能在某些情况下失效的bug
- 修复功能色筛选偶尔失效的问题`,

            '1.0.0': `# 版本 1.0.0 (2024-03-20)

## 初始功能
- 支持多种拼豆品牌（Mard/咪小窝/黄豆豆等）
- 图片自动转换为拼豆色号
- 支持图片切片显示
- 支持颜色替换功能
- 支持水平和垂直镜像
- 支持功能色筛选（夜光/果冻/珠光/温变）
- 支持图片尺寸调整
- 支持颜色统计功能`
        };
    }

    async showChangelogIfNeeded() {
        const today = new Date().toDateString();
        if (this.lastShownDate !== today) {
            await this.showChangelog();
            localStorage.setItem('lastShownChangelogDate', today);
        }
    }

    async showChangelog() {
        try {
            // 直接显示最新版本的更新日志
            const changelog = this.changelogs[this.currentVersion];
            if (changelog) {
                this.showChangelogModal(changelog, this.currentVersion);
            } else {
                console.error('找不到更新日志');
            }
        } catch (error) {
            console.error('显示更新日志时发生错误:', error);
        }
    }

    showChangelogModal(content, version) {
        // 获取所有历史版本并排序
        const versions = Object.keys(this.changelogs)
            .sort()
            .reverse()
            .filter(v => v !== version);
        
        // 生成历史版本下拉列表
        const historySelect = versions.length > 0 ? `
            <div class="mt-4 border-top pt-3">
                <div class="d-flex align-items-center">
                    <label class="mr-2 mb-0">历史版本：</label>
                    <select class="form-control form-control-sm w-auto" id="historyVersionSelect">
                        <option value="">选择版本...</option>
                        ${versions.map(v => `<option value="${v}">v${v}</option>`).join('')}
                    </select>
                </div>
                <div id="historyContent" class="mt-3" style="display:none;">
                    <!-- 这里会显示历史版本的内容 -->
                </div>
            </div>` : '';

        // 将Markdown转换为HTML
        const htmlContent = this.markdownToHtml(content);
        
        // 创建模态框
        const modal = `
        <div class="modal fade" id="changelogModal" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">更新日志 v${version}</h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body changelog-content">
                        ${htmlContent}
                        ${historySelect}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal">确定</button>
                    </div>
                </div>
            </div>
        </div>`;

        // 添加模态框到页面
        document.body.insertAdjacentHTML('beforeend', modal);
        
        // 绑定历史版本选择事件
        $('#historyVersionSelect').on('change', (e) => {
            const selectedVersion = e.target.value;
            const $historyContent = $('#historyContent');
            
            if (selectedVersion) {
                const historyLog = this.changelogs[selectedVersion];
                if (historyLog) {
                    const historyHtml = this.markdownToHtml(historyLog);
                    $historyContent.html(`
                        <div class="border-top pt-3">
                            <h6>v${selectedVersion} 更新内容：</h6>
                            <div class="pl-3">
                                ${historyHtml}
                            </div>
                        </div>
                    `).show();
                }
            } else {
                $historyContent.hide();
            }
        });
        
        // 显示模态框
        $('#changelogModal').modal('show');
        
        // 模态框关闭后删除
        $('#changelogModal').on('hidden.bs.modal', function() {
            $(this).remove();
        });
    }

    markdownToHtml(markdown) {
        // 简单的Markdown转HTML实现
        return markdown
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/- (.*$)/gm, '<li>$1</li>')
            .replace(/\n\n/g, '<br>');
    }
} 