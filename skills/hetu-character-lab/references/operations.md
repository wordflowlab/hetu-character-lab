# 操作地图

由正式清单生成，执行前发现当前安装版Schema。

| 动作 | 用途 | 必填参数 | 效果 |
| --- | --- | --- | --- |
| list_projects | 查找方案 |  | read |
| get_project | 读取固定方案 | object_id | read |
| save_project | 保存完整方案 | expected_revision, expected_sha256, operation_key, content | managed_write |
| put_character | 维护人物侧写 | object_id, expected_revision, expected_sha256, operation_key, character | managed_write |
| remove_character | 移除无依赖侧写 | object_id, expected_revision, expected_sha256, operation_key, character_id | managed_write |
| put_hypothesis | 维护动机假设 | object_id, expected_revision, expected_sha256, operation_key, hypothesis | managed_write |
| remove_hypothesis | 移除假设 | object_id, expected_revision, expected_sha256, operation_key, hypothesis_id | managed_write |
| put_interview | 维护访谈 | object_id, expected_revision, expected_sha256, operation_key, interview | managed_write |
| remove_interview | 移除访谈 | object_id, expected_revision, expected_sha256, operation_key, interview_id | managed_write |
| put_trial | 维护对白试演 | object_id, expected_revision, expected_sha256, operation_key, trial | managed_write |
| remove_trial | 移除试演 | object_id, expected_revision, expected_sha256, operation_key, trial_id | managed_write |
| put_arc | 维护弧光 | object_id, expected_revision, expected_sha256, operation_key, arc | managed_write |
| remove_arc | 移除弧光 | object_id, expected_revision, expected_sha256, operation_key, arc_id | managed_write |
| measure_mentions | 测量显式姓名与别名提及 | object_id, source_indices | read |
| get_character_context | 准备人物上下文 | object_id, goal, max_chars | read |
| check_development | 检查弧光依据与未确认项 | object_id | read |
| create_handoff | 生成固定专业交接 | object_id, goal | read |
| get_source | 读取固定依据 | object_id, source_index | read |
| get_basis | 读取固定上游成果 | object_id, basis_index | read |
| compare_versions | 比较专业修订 | object_id, from_revision, to_revision | read |
| export_project | 导出固定成果 | object_id, format | read |
| get_operation | 回读原操作 | operation_key | read |
