"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
<<<<<<< HEAD
import { supabase } from "@/lib/supabase";
import { ChevronDown, ChevronUp, Users, Search } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const GOLD = "#d4a017";
const COLORS = ["#10d9a0", GOLD, "#3b9eff", "#a78bfa", "#fb923c", "#f472b6"];

export default function TeacherClasses() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [students, setStudents] = useState<Record<string, any[]>>({});
  const [search, setSearch] = useState<Record<string, string>>({});
  const [attendStats, setAttendStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user?.id) load(); }, [user]);

  async function load() {
    const { data } = await supabase
      .from("teacher_class_subjects")
      .select("*, classes(id,name,section,grade), subjects(id,name)")
      .eq("teacher_id", user!.id);
    setAssignments(data || []);
    setLoading(false);
  }

  async function toggle(classId: string) {
    if (expanded === classId) { setExpanded(null); return; }
    setExpanded(classId);
    if (!students[classId]) {
      const { data } = await supabase
        .from("users").select("national_id,full_name")
        .eq("class_id", classId).eq("role", "student").order("full_name");
      setStudents(p => ({ ...p, [classId]: data || [] }));

      // Attendance stats for pie
      const ids = (data || []).map((s: any) => s.national_id);
      if (ids.length) {
        const { data: att } = await supabase.from("attendance")
          .select("status").in("student_national_id", ids).eq("class_id", classId);
        const stat: Record<string, number> = { حاضر: 0, غائب: 0, متأخر: 0, مستأذن: 0 };
        (att || []).forEach((a: any) => { stat[a.status] = (stat[a.status] || 0) + 1; });
        setAttendStats(p => ({ ...p, [classId]: stat }));
      }
    }
  }

  // Group by class
  const byClass: Record<string, any[]> = {};
  assignments.forEach(a => {
    if (!byClass[a.class_id]) byClass[a.class_id] = [];
    byClass[a.class_id].push(a);
  });

  const attColors: Record<string, string> = { حاضر: "#10d9a0", غائب: "#ff4d6d", متأخر: "#ffb703", مستأذن: "#3b9eff" };

  if (loading) return <DashboardLayout><div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><div className="spinner" /></div></DashboardLayout>;

  if (assignments.length === 0) return (
    <DashboardLayout>
      <div className="empty-state">
        <div className="empty-state-icon">🏫</div>
        <div className="empty-state-title">لم يتم إسناد فصول بعد</div>
        <div className="empty-state-sub">يقوم المدير بإسناد الفصول والمواد من لوحة الإدارة</div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="animate-fade-up" dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h1 className="page-title">فصولي الدراسية</h1>
          <p className="page-subtitle">{Object.keys(byClass).length} فصل — {assignments.length} مادة مُسندة</p>
        </div>

        {Object.entries(byClass).map(([classId, asgns], idx) => {
          const cls = asgns[0].classes;
          const isExp = expanded === classId;
          const sts = students[classId] || [];
          const q = search[classId] || "";
          const filtered = q ? sts.filter(s => s.full_name?.includes(q)) : sts;
          const attStat = attendStats[classId] || {};
          const attData = Object.entries(attStat).filter(([, v]) => (v as number) > 0)
            .map(([name, value]) => ({ name, value }));
          const color = COLORS[idx % COLORS.length];

          return (
            <div key={classId} className="card" style={{ overflow: "hidden" }}>
              {/* Header */}
              <button
                onClick={() => toggle(classId)}
                style={{ width: "100%", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 14, background: "none", border: "none", cursor: "pointer", fontFamily: "'Cairo',sans-serif", flexWrap: "wrap" }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 13, background: `${color}18`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color, flexShrink: 0 }}>
                  {cls?.section}
                </div>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#f0f4ff" }}>{cls?.name}</div>
                  <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                    {asgns.map((a: any) => (
                      <span key={a.id} style={{ fontSize: 10, padding: "2px 8px", background: `${color}12`, border: `1px solid ${color}20`, borderRadius: 999, color }}>
                        {a.subjects?.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  {sts.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
                      <Users size={13} />
                      <span style={{ fontWeight: 700 }}>{sts.length}</span>
                    </div>
                  )}
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: isExp ? `${color}15` : "rgba(255,255,255,0.04)", border: `1px solid ${isExp ? color : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isExp ? <ChevronUp size={14} color={color} /> : <ChevronDown size={14} color="#475569" />}
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              {isExp && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: attData.length ? "2fr 1fr" : "1fr", gap: 0 }}>

                    {/* Student list */}
                    <div style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", letterSpacing: "0.05em" }}>
                          قائمة الطلاب ({sts.length})
                        </div>
                        <div style={{ position: "relative" }}>
                          <Search size={11} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
                          <input
                            value={q}
                            onChange={e => setSearch(p => ({ ...p, [classId]: e.target.value }))}
                            placeholder="بحث..."
                            style={{ width: 140, padding: "0.3rem 0.6rem 0.3rem 0.5rem", paddingRight: 24, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 11, color: "#94a3b8", outline: "none", fontFamily: "'Cairo',sans-serif" }}
                          />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 6, maxHeight: 260, overflowY: "auto" }} className="scrollbar-thin">
                        {filtered.length === 0 ? (
                          <p style={{ fontSize: 12, color: "#475569", padding: "1rem" }}>لا يوجد طلاب</p>
                        ) : filtered.map((s, i) => (
                          <div key={s.national_id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.4rem 0.625rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 9 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 6, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color, flexShrink: 0 }}>{i + 1}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.full_name}</div>
                              <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace" }}>{s.national_id}</div>
                            </div>
=======
import { supabase } from "@/hooks/useData";
import { Users, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
export default function TeacherClasses() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string|null>(null);
  const [students, setStudents] = useState<Record<string,any[]>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (user?.id) load(); }, [user]);
  async function load() {
    const { data } = await supabase.from("teacher_class_subjects").select("*, classes(*), subjects(*)").eq("teacher_id", user!.id);
    setAssignments(data || []);
    setLoading(false);
  }
  async function loadStudents(classId: string) {
    if (students[classId]) return;
    const { data } = await supabase.from("student_profiles").select("*").eq("class_id", classId).order("full_name");
    setStudents(prev => ({ ...prev, [classId]: data || [] }));
  }
  const toggle = (id: string, classId: string) => {
    if (expanded === id) { setExpanded(null); } else { setExpanded(id); loadStudents(classId); }
  };
  // Group by class
  const byClass: Record<string, any[]> = {};
  assignments.forEach(a => {
    const k = a.class_id;
    if (!byClass[k]) byClass[k] = [];
    byClass[k].push(a);
  });
  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 rounded-full animate-spin" style={{borderColor:"#c9970c",borderTopColor:"transparent"}}/></div></DashboardLayout>;
  if (assignments.length===0) return <DashboardLayout><div className="text-center py-24" dir="rtl"><div className="text-5xl mb-4">🏫</div><h2 className="text-xl font-black mb-2">لم يتم تعيينك لأي فصل بعد</h2><p style={{color:"#888"}}>يقوم المدير بتعيين الفصول والمواد للمعلمين</p></div></DashboardLayout>;
  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div><h1 className="text-2xl font-black" style={{color:"#0a0a0a"}}>فصولي الدراسية</h1><p className="text-sm mt-1" style={{color:"#888"}}>{Object.keys(byClass).length} فصل — {assignments.length} مادة</p></div>
        <div className="space-y-4">
          {Object.entries(byClass).map(([classId, asgns]) => {
            const cls = asgns[0].classes;
            const isExp = expanded === classId;
            const sts = students[classId] || [];
            return (
              <div key={classId} className="rounded-2xl overflow-hidden" style={{background:"#fff",border:"1px solid #e8e8e8"}}>
                <button className="w-full flex items-center gap-4 p-5 text-right" onClick={()=>toggle(classId,classId)}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg" style={{background:"rgba(184,134,11,0.1)",color:"#c9970c"}}>{cls?.section}</div>
                  <div className="flex-1">
                    <div className="font-black text-sm" style={{color:"#0a0a0a"}}>{cls?.name}</div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {asgns.map((a:any)=><span key={a.id} className="text-xs px-2 py-0.5 rounded-full" style={{background:"rgba(184,134,11,0.08)",color:"#c9970c"}}>{a.subjects?.name}</span>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm" style={{color:"#888"}}>
                    <span className="flex items-center gap-1"><Users size={14}/> {isExp&&sts.length>0 ? sts.length : "..."}</span>
                    {isExp ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                  </div>
                </button>
                {isExp && (
                  <div className="px-5 pb-5 border-t" style={{borderColor:"#f0f0f0"}}>
                    <div className="pt-4">
                      <p className="text-xs font-black mb-3" style={{color:"#888"}}>طلاب الفصل ({sts.length})</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sts.map((s:any,i:number)=>(
                          <div key={s.national_id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{background:"#fafafa",border:"1px solid #f0f0f0"}}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black" style={{background:"rgba(184,134,11,0.1)",color:"#c9970c"}}>{i+1}</div>
                            <div className="flex-1 text-sm font-semibold truncate" style={{color:"#333"}}>{s.full_name}</div>
                            <div className="text-xs" style={{color:"#aaa",fontFamily:"monospace"}}>{s.national_id}</div>
>>>>>>> 6a5b527cad545db71c1d5a7bf16bd53609a27c53
                          </div>
                        ))}
                      </div>
                    </div>
<<<<<<< HEAD

                    {/* Attendance pie */}
                    {attData.length > 0 && (
                      <div style={{ padding: "1rem 1.25rem", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", letterSpacing: "0.05em", marginBottom: 8 }}>إجمالي الحضور</div>
                        <ResponsiveContainer width="100%" height={130}>
                          <PieChart>
                            <Pie data={attData} cx="50%" cy="50%" outerRadius={50} paddingAngle={3} dataKey="value">
                              {attData.map((d: any) => <Cell key={d.name} fill={attColors[d.name] || GOLD} strokeWidth={0} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: "#0c1220", border: "1px solid rgba(212,160,23,0.3)", borderRadius: 10, fontSize: 11 }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {attData.map((d: any) => (
                            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: attColors[d.name], flexShrink: 0 }} />
                              <span style={{ fontSize: 10, color: "#94a3b8", flex: 1 }}>{d.name}</span>
                              <span style={{ fontSize: 11, fontWeight: 800, color: attColors[d.name] }}>{d.value as number}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
=======
                  </div>
                )}
              </div>
            );
          })}
        </div>
>>>>>>> 6a5b527cad545db71c1d5a7bf16bd53609a27c53
      </div>
    </DashboardLayout>
  );
}
