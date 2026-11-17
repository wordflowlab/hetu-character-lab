> 本文属于[人物工坊文档](README.md)。

# 数据与API设计

## 1. 唯一合同

插件ID`org.wordflowlab.character-lab`，专业类型`character_lab`，作品范围为novel，格式1。正式字段、长度、枚举、必填和预算由`contracts/plugin-manifest.json`维护；操作地图从清单生成，避免手抄Schema。工程实施前先按下表定义闭合输入与专业不变量。

## 2. 动作

| 动作 | 用途 |
| --- | --- |
| `list_projects` | 分页查找专业方案 |
| `get_project` | 读取当前或固定修订 |
| `save_project` | 新建或完整CAS保存 |
| `get_source` | 读取固定依据 |
| `get_basis` | 核对并读取固定上游专业成果 |
| `compare_versions` | 比较固定专业修订 |
| `export_project` | 分块导出JSON、Markdown或离线HTML |
| `get_operation` | 回读原操作 |
| `put_character` | 维护人物侧写 |
| `remove_character` | 移除无依赖侧写 |
| `put_hypothesis` | 维护动机假设 |
| `remove_hypothesis` | 移除假设 |
| `put_interview` | 维护访谈 |
| `remove_interview` | 移除访谈 |
| `put_trial` | 维护对白试演 |
| `remove_trial` | 移除试演 |
| `put_arc` | 维护弧光 |
| `remove_arc` | 移除弧光 |
| `measure_mentions` | 测量显式姓名与别名提及 |
| `get_character_context` | 准备人物上下文 |
| `check_development` | 检查弧光依据与未确认项 |
| `create_handoff` | 生成固定专业交接 |

put／remove／save动作为managed_write，其他为read。新建使用expected_revision=0及空expected_sha256；更新要求object_id、确切修订与摘要，所有写入携带operation_key。缺基线、错来源、悬空ID、非法字节与同键不同输入必须失败。

来源最多100项、单对象512KiB，长篇分为多个可接续专业方案；文本处理总字节另有显式上限，超限返回缺口，不静默裁剪关键依据。build上下文返回计量和遗漏，字符不冒充模型Token或费用。

## 3. 引用与恢复

引文为UTF-8半开范围，必须等于固定原文；资料内容、文稿及正式设定按各自类型读取。正式人物引用需固定设定中真实存在。上游专业依据通过同作品Owner＋固定修订读取，校验摘要；当前头变化不会改变旧依据。错误Owner、作品或摘要拒绝。

导出固定对象、来源和上游引用，带完整内容摘要及UTF-8分页；HTML离线、转义数据、不自动外发。get_source只读已声明来源；get_basis只读已声明固定专业依据。unknown先get_operation，明确not_found才按原输入执行，CAS冲突不更换原基线强写。

## 4. 导出响应合同

`export_project`返回固定project_ref、media_type、offset、next_offset、total_bytes、content。`content_sha256`及`chunk_sha256`均核验当前分块；`report_sha256`核验完整UTF-8报告。宿主按固定对象、媒体类型、总字节及连续偏移写临时文件，全部成功后替换目标。

## 5. 专业不变量

- 正式人物引用同时固定设定来源和真实实体；探索侧写不自动写回正式设定。
- 有据假设、grounded访谈与observed弧光须有原文证据；探索访谈与计划弧光保留候选身份。
- 试演参与者必须存在，台词人物属于本次参与者；有人物依赖时拒绝删除。
- 姓名计量只使用显式姓名与别名，按字面最长匹配返回UTF-8位置。歧义命中单列，正则字符按字面解释。
- 字面提及不等于实际出场、重要性或人格分数。筛选人物上下文仍保留试演所需的其他参与者。

来源读取上限为2MiB，包含返回的来源元数据；超过时返回hetu.budget_exceeded，不静默截断。专业对象512KiB、最多100项来源与20项专业依据。上下文按完整字段选材，返回omitted_fields、used_chars及max_chars；目标本身超限时失败。省略字段可沿固定对象继续读取。
