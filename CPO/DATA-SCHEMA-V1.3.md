# 数据配置表 Schema — v1.3

**版本**：v1.3
**日期**：2026-03-01
**作者**：CPO
**用途**：CTO 可直接用于 TypeScript 类型生成 + 数据校验

---

## 1. 副本配置 (Dungeon)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Dungeon",
  "required": ["id", "name", "chapter", "icon", "requiredLevel", "requiredRealm", "dailyLimit", "waves", "boss", "rewards", "firstClearReward"],
  "properties": {
    "id": {
      "type": "string",
      "description": "副本唯一ID",
      "pattern": "^[a-z_]+$",
      "examples": ["wuxingshan", "yingchoujian"]
    },
    "name": {
      "type": "string",
      "description": "副本中文名称"
    },
    "chapter": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10,
      "description": "取经路第几难"
    },
    "icon": {
      "type": "string",
      "description": "副本 emoji 图标"
    },
    "description": {
      "type": "string",
      "description": "副本剧情描述"
    },
    "requiredLevel": {
      "type": "integer",
      "minimum": 1,
      "description": "解锁所需玩家等级"
    },
    "requiredRealm": {
      "type": "string",
      "enum": ["灵猴初醒", "通灵", "炼气", "筑基", "金丹", "元婴", "化神", "大乘", "齐天大圣", "斗战胜佛"],
      "description": "解锁所需境界"
    },
    "prerequisite": {
      "type": ["string", "null"],
      "description": "前置副本ID，null 表示无前置"
    },
    "dailyLimit": {
      "type": "integer",
      "minimum": 1,
      "default": 3,
      "description": "每日挑战次数上限"
    },
    "timeLimitSec": {
      "type": "integer",
      "default": 300,
      "description": "战斗时间限制（秒）"
    },
    "waves": {
      "type": "array",
      "description": "关卡波次列表",
      "items": { "$ref": "#/$defs/DungeonWave" }
    },
    "boss": { "$ref": "#/$defs/DungeonBoss" },
    "rewards": { "$ref": "#/$defs/DungeonReward" },
    "firstClearReward": { "$ref": "#/$defs/DungeonReward" }
  },
  "$defs": {
    "DungeonWave": {
      "type": "object",
      "required": ["waveNum", "type", "enemies"],
      "properties": {
        "waveNum": { "type": "integer", "minimum": 1 },
        "type": { "type": "string", "enum": ["normal", "elite"] },
        "enemies": {
          "type": "array",
          "items": { "$ref": "#/$defs/WaveEnemy" }
        }
      }
    },
    "WaveEnemy": {
      "type": "object",
      "required": ["name", "icon", "hp", "attack", "defense"],
      "properties": {
        "name": { "type": "string" },
        "icon": { "type": "string" },
        "hp": { "type": "integer", "minimum": 1 },
        "attack": { "type": "integer", "minimum": 1 },
        "defense": { "type": "integer", "minimum": 0 },
        "count": { "type": "integer", "default": 1, "description": "同时出现数量" }
      }
    },
    "DungeonBoss": {
      "type": "object",
      "required": ["name", "icon", "hp", "attack", "defense", "skills", "phases"],
      "properties": {
        "name": { "type": "string" },
        "icon": { "type": "string" },
        "hp": { "type": "integer", "minimum": 1 },
        "attack": { "type": "integer", "minimum": 1 },
        "defense": { "type": "integer", "minimum": 0 },
        "skills": {
          "type": "array",
          "items": { "$ref": "#/$defs/BossSkill" }
        },
        "phases": {
          "type": "array",
          "items": { "$ref": "#/$defs/BossPhase" }
        }
      }
    },
    "BossSkill": {
      "type": "object",
      "required": ["id", "name", "damage", "cooldownSec", "type", "warning"],
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "damage": { "type": "integer", "description": "固定伤害值" },
        "damagePercent": { "type": "number", "description": "按玩家HP百分比伤害，0-1" },
        "cooldownSec": { "type": "integer", "minimum": 1 },
        "type": { "type": "string", "enum": ["single", "aoe"] },
        "warning": { "type": "string", "description": "预警文案" },
        "warningTimeSec": { "type": "integer", "default": 3 },
        "dodgeable": { "type": "boolean", "default": true }
      }
    },
    "BossPhase": {
      "type": "object",
      "required": ["hpThreshold", "description"],
      "properties": {
        "hpThreshold": { "type": "number", "minimum": 0, "maximum": 1, "description": "HP百分比触发点" },
        "description": { "type": "string" },
        "attackMultiplier": { "type": "number", "default": 1.0 },
        "speedMultiplier": { "type": "number", "default": 1.0 },
        "unlockSkills": { "type": "array", "items": { "type": "string" }, "description": "此阶段解锁的技能ID" }
      }
    },
    "DungeonReward": {
      "type": "object",
      "properties": {
        "lingshi": { "type": "integer", "default": 0 },
        "exp": { "type": "integer", "default": 0 },
        "pantao": { "type": "integer", "default": 0 },
        "equipmentIds": {
          "type": "array",
          "items": { "type": "string" },
          "description": "固定掉落装备模板ID"
        },
        "randomEquipPool": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["templateId", "chance"],
            "properties": {
              "templateId": { "type": "string" },
              "chance": { "type": "number", "minimum": 0, "maximum": 1 }
            }
          },
          "description": "概率掉落池"
        }
      }
    }
  }
}
```

---

## 2. 成就配置 (Achievement)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Achievement",
  "required": ["id", "name", "icon", "description", "category", "condition", "reward"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^ach_[a-z_]+$"
    },
    "name": { "type": "string" },
    "icon": { "type": "string" },
    "description": { "type": "string" },
    "category": {
      "type": "string",
      "enum": ["milestone", "challenge"]
    },
    "hidden": {
      "type": "boolean",
      "default": false,
      "description": "隐藏成就，达成前不显示条件"
    },
    "condition": {
      "type": "object",
      "required": ["type", "target"],
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "level", "kill_count", "equipment_count", "dungeon_clear",
            "dungeon_speed", "no_damage", "enhance_max", "online_time",
            "gold_total", "win_streak", "dodge_streak", "solo_boss",
            "collect_unique", "realm_reach"
          ]
        },
        "target": { "type": "number", "description": "达成目标值" },
        "dungeonId": { "type": "string", "description": "关联副本ID（副本类成就）" },
        "bossId": { "type": "string", "description": "关联Boss ID" }
      }
    },
    "reward": {
      "type": "object",
      "required": ["type", "value"],
      "properties": {
        "type": {
          "type": "string",
          "enum": ["stat_boost", "resource", "title", "unlock"]
        },
        "stat": {
          "type": "string",
          "enum": ["attack", "defense", "speed", "hp", "critRate", "critDmg", "all"],
          "description": "stat_boost 时指定属性"
        },
        "value": { "type": "number", "description": "百分比或数量" },
        "resourceType": {
          "type": "string",
          "enum": ["lingshi", "pantao", "xianshi", "hongmengShards"],
          "description": "resource 时指定资源类型"
        },
        "title": { "type": "string", "description": "title 时的称号文案" },
        "unlockType": {
          "type": "string",
          "enum": ["bag_expand", "offline_boost"],
          "description": "unlock 时的解锁类型"
        }
      }
    }
  }
}
```

---

## 3. 排行榜配置 (Leaderboard)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "LeaderboardConfig",
  "required": ["id", "name", "icon", "sortBy", "maxEntries"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^lb_[a-z_]+$"
    },
    "name": { "type": "string" },
    "icon": { "type": "string" },
    "description": { "type": "string" },
    "sortBy": {
      "type": "string",
      "enum": ["desc", "asc"],
      "description": "desc=越大越好（战力），asc=越小越好（速通时间）"
    },
    "scoreType": {
      "type": "string",
      "enum": ["combat_power", "dungeon_time", "kill_count", "level", "collect_count"],
      "description": "计分类型"
    },
    "maxEntries": {
      "type": "integer",
      "default": 10,
      "description": "本地保留记录数"
    },
    "refreshCycle": {
      "type": "string",
      "enum": ["none", "daily", "weekly"],
      "default": "none",
      "description": "刷新周期。none=永久保留"
    },
    "dungeonId": {
      "type": "string",
      "description": "关联副本ID（速通排行用）"
    },
    "rewardTiers": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["rank", "reward"],
        "properties": {
          "rank": { "type": "integer", "description": "名次" },
          "reward": { "$ref": "#/$defs/LeaderboardReward" }
        }
      },
      "description": "排名奖励（在线模式预留）"
    }
  },
  "$defs": {
    "LeaderboardReward": {
      "type": "object",
      "properties": {
        "lingshi": { "type": "integer" },
        "pantao": { "type": "integer" },
        "title": { "type": "string" }
      }
    }
  }
}
```

---

## 4. 战力计算公式 Schema

```json
{
  "type": "object",
  "title": "CombatPowerFormula",
  "properties": {
    "weights": {
      "type": "object",
      "properties": {
        "attack": { "type": "number", "default": 1.0 },
        "defense": { "type": "number", "default": 0.8 },
        "speed": { "type": "number", "default": 0.5 },
        "hp": { "type": "number", "default": 0.3 }
      }
    },
    "realmCoefficients": {
      "type": "object",
      "description": "境界名 → 系数映射",
      "additionalProperties": { "type": "number" }
    }
  }
}
```
