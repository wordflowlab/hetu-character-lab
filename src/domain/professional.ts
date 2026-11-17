import { requireValue as need } from "../../vendor/project-store.ts";
import { span, sourceText, uniqueIds } from "./text.ts";
export const fields = {
  character: "characters",
  hypothesis: "hypotheses",
  interview: "interviews",
  trial: "trials",
  arc: "arcs",
};
export const defaults = () => ({
  characters: [],
  hypotheses: [],
  interviews: [],
  trials: [],
  arcs: [],
});
export function validateDomain(p: any) {
  const ids = new Set(p.characters.map((c: any) => c.id));
  const exists = (id: string) => need(ids.has(id), "引用的人物侧写不存在。");
  for (const c of p.characters) {
    need(
      (c.entity_ref === null) === (c.blueprint_source_index === null),
      "正式人物引用与固定设定来源须同时填写。",
    );
    uniqueIds([c.name, ...c.aliases], "人物姓名与别名重复。");
  }
  for (const field of ["hypotheses", "interviews", "arcs"])
    for (const v of p[field]) {
      exists(v.character_id);
      if (
        v.status === "supported" ||
        v.mode === "grounded" ||
        v.stage === "observed"
      )
        need(v.evidence.length > 0, "有据假设、访谈和已发生弧光须有证据。");
    }
  for (const t of p.trials) {
    uniqueIds(t.participants, "试演人物重复。");
    need(t.participants.length > 0, "试演至少包含一位人物。");
    t.participants.forEach(exists);
    for (const l of t.lines)
      need(
        t.participants.includes(l.character_id),
        "台词人物不在本次试演参与者内。",
      );
  }
}
export async function checkSources(p: any, sources: any[]) {
  for (const c of p.characters)
    if (c.entity_ref !== null) {
      const root =
        sources[c.blueprint_source_index]?.blueprint ??
        sources[c.blueprint_source_index];
      const b = root?.content ?? root;
      need(
        b?.characters?.some((x: any) => x.character_id === c.entity_ref),
        "固定设定中不存在该正式人物。",
      );
    }
}
export function mentions(p: any, sources: any[], indices: number[]) {
  uniqueIds(indices.map(String), "提及计量来源重复。");
  const names = new Map<string, Set<string>>();
  for (const c of p.characters)
    for (const name of [c.name, ...c.aliases]) {
      need(name.length > 0, "姓名不能为空。");
      if (!names.has(name)) names.set(name, new Set());
      names.get(name)!.add(c.id);
    }
  const sorted = [...names.keys()].sort(
    (a, b) => b.length - a.length || a.localeCompare(b),
  );
  const hits: any[] = [],
    counts = Object.fromEntries(p.characters.map((c: any) => [c.id, 0]));
  for (const index of indices) {
    need(sources[index], "计量来源索引越界。");
    const text = sourceText(sources[index]);
    let i = 0,
      offset = 0;
    while (i < text.length) {
      const name = sorted.find((n) => text.startsWith(n, i));
      if (name) {
        const ids = [...names.get(name)!],
          length = new TextEncoder().encode(name).length;
        hits.push({
          source_index: index,
          byte_start: offset,
          byte_end: offset + length,
          text: name,
          character_id: ids.length === 1 ? ids[0] : null,
          ambiguous_ids: ids.length === 1 ? [] : ids,
        });
        if (ids.length === 1) counts[ids[0]]++;
        offset += length;
        i += name.length;
      } else {
        const code = String.fromCodePoint(text.codePointAt(i)!);
        i += code.length;
        offset += new TextEncoder().encode(code).length;
      }
    }
  }
  return {
    metric: "literal_mentions",
    note: "仅为显式姓名和别名的字面提及，不代表人物实际出场、重要性或心理状态。",
    counts,
    hits,
    unassigned: hits.filter((h) => h.character_id === null),
  };
}
export function contextProject(p: any, i: any) {
  if (!i.character_id) return p;
  need(
    p.characters.some((c: any) => c.id === i.character_id),
    "人物不存在。",
  );
  const trials = p.trials.filter((t: any) =>
      t.participants.includes(i.character_id),
    ),
    ids = new Set([
      i.character_id,
      ...trials.flatMap((t: any) => t.participants),
    ]);
  return {
    ...p,
    characters: p.characters.filter((c: any) => ids.has(c.id)),
    hypotheses: p.hypotheses.filter(
      (x: any) => x.character_id === i.character_id,
    ),
    interviews: p.interviews.filter(
      (x: any) => x.character_id === i.character_id,
    ),
    arcs: p.arcs.filter((x: any) => x.character_id === i.character_id),
    trials,
  };
}
export function readProfessional(
  action: string,
  p: any,
  sources: any[],
  i: any,
): any {
  if (action === "measure_mentions")
    return mentions(p, sources, i.source_indices);
  if (action === "check_development")
    return {
      valid: true,
      exploratory_interviews: p.interviews
        .filter((x: any) => x.mode === "exploratory")
        .map((x: any) => x.id),
      planned_arcs: p.arcs
        .filter((x: any) => x.stage === "planned")
        .map((x: any) => x.id),
      unconfirmed_hypotheses: p.hypotheses
        .filter((x: any) => x.status !== "supported")
        .map((x: any) => x.id),
      note: "人物解释与试演是创作候选，不自动写入正式设定或正文。",
    };
}
