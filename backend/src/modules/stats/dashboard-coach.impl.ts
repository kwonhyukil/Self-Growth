type DashboardFocus = {
  message: string;
  action: string;
};

type RuleTagCount = {
  ruleTag: string;
  count: number;
};

type JaImprovementLike = {
  ruleTagTop: RuleTagCount[];
};

type QualityRow = {
  deltaIssueCount: number | null;
};

function focusMessage(ruleTag: string): DashboardFocus {
  const map: Record<string, DashboardFocus> = {
    particle: {
      message:
        "조사(은/는/이/가/을/를) 선택이 자주 지적됩니다. 문장 안 역할을 먼저 나눠 보세요.",
      action:
        "주어/목적어/목적지 표시가 필요한지 확인하고 조사만 바꿔서 한 번 다시 써보세요.",
    },
    naturalness: {
      message:
        "자연스러움 관련 지적이 반복됩니다. 더 자주 쓰는 표현으로 바꾸면 문장이 부드러워집니다.",
      action: "어색한 구절 하나만 골라 더 자연스러운 말로 바꿔 보세요.",
    },
    collocation: {
      message:
        "단어 조합이 어색한 경우가 보입니다. 함께 자주 쓰는 표현을 먼저 익히는 게 좋습니다.",
      action: "동사와 목적어 조합 하나만 더 흔한 조합으로 바꿔 보세요.",
    },
    kanji_kana: {
      message:
        "한자/가나 표기가 흔들립니다. 표기를 통일하면 문장 안정감이 좋아집니다.",
      action: "같은 단어의 표기를 한자 또는 가나 중 하나로 통일해 보세요.",
    },
    word_choice: {
      message:
        "단어 선택이 자주 막힙니다. 뜻은 유지하고 더 일반적인 단어로 바꿔 보는 게 좋습니다.",
      action: "의미는 같지만 더 자주 쓰는 단어로 하나만 교체해 보세요.",
    },
    style_mix: {
      message:
        "문체 혼용이 보입니다. 한 문장 안에서는 톤을 맞추는 편이 더 자연스럽습니다.",
      action: "한 문장만 골라 반말 또는 정중체로 통일해 보세요.",
    },
    other: {
      message:
        "전반적으로 문장을 조금 더 구체적으로 쓰면 피드백 품질이 좋아집니다.",
      action: "상대, 상황, 결과 중 두 가지를 더 붙여 보세요.",
    },
  };

  return map[ruleTag] ?? map.other;
}

function coachQuestion(ruleTag: string): string {
  const map: Record<string, string> = {
    particle:
      "이 문장에서 주어, 목적어, 장소를 나타내는 조사부터 다시 확인해볼까요?",
    naturalness:
      "어색하다고 느껴지는 구절 하나만 골라 더 자주 쓰는 말로 바꿔볼까요?",
    collocation:
      "동사와 목적어 조합 하나만 더 흔한 표현으로 바꿔볼까요?",
    kanji_kana:
      "표기가 흔들리는 단어 하나만 골라 한자/가나 중 하나로 통일해볼까요?",
    word_choice:
      "뜻은 같지만 더 일반적으로 쓰는 단어로 바꿀 수 있는 부분이 있을까요?",
    style_mix:
      "이 문장만이라도 반말 또는 정중체 중 하나로 통일해볼까요?",
    other:
      "상황이나 결과를 한 문장 더 붙여서 더 구체적으로 적어볼까요?",
  };

  return map[ruleTag] ?? map.other;
}

export function buildDashboardCoach(
  d7: JaImprovementLike,
  d30: JaImprovementLike,
  qualityRows: QualityRow[],
) {
  const totalRevisions30d = qualityRows.length;
  const nullDeltaCount30d = qualityRows.filter(
    (r) => r.deltaIssueCount == null,
  ).length;
  const zeroDeltaCount30d = qualityRows.filter(
    (r) => r.deltaIssueCount === 0,
  ).length;

  const weekTop1 = d7.ruleTagTop?.[0]?.ruleTag ?? null;
  const monthTop1 = d30.ruleTagTop?.[0]?.ruleTag ?? null;
  const monthTop2 = d30.ruleTagTop?.[1]?.ruleTag ?? null;

  const weekRuleTag = weekTop1 ?? monthTop1 ?? "other";

  let monthRuleTag = monthTop1 ?? "other";
  if (monthRuleTag === weekRuleTag && monthTop2) {
    monthRuleTag = monthTop2;
  }

  const weekFocus = focusMessage(weekRuleTag);
  const monthFocus = focusMessage(monthRuleTag);

  const nextTargets = (d30.ruleTagTop ?? [])
    .map((x) => x.ruleTag)
    .filter((tag) => tag !== weekRuleTag && tag !== monthRuleTag)
    .slice(0, 2)
    .map((tag) => ({
      ruleTag: tag,
      message: focusMessage(tag).message,
    }));

  return {
    ja: { d7, d30 },
    insights: {
      weekTopFocus: { ruleTag: weekRuleTag, ...weekFocus },
      monthTopFocus: { ruleTag: monthRuleTag, ...monthFocus },
      nextTargets,
    },
    coach: {
      week: {
        focusRuleTag: weekRuleTag,
        why: d7.ruleTagTop?.length
          ? "최근 7일 기준 가장 자주 지적된 유형입니다."
          : "최근 7일 데이터가 부족해 30일 기준으로 추천합니다.",
        oneAction: weekFocus.action,
        nextQuestion: coachQuestion(weekRuleTag),
      },
      month: {
        focusRuleTag: monthRuleTag,
        why: "최근 30일 기준 가장 자주 지적된 유형입니다.",
        oneAction: monthFocus.action,
        nextQuestion: coachQuestion(monthRuleTag),
      },
    },
    dataQuality: {
      totalRevisions30d,
      nullDeltaCount30d,
      zeroDeltaCount30d,
    },
  };
}
