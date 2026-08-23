'use client';

interface DocumentItem {
  id: string;
  code: string;
  title: string;
  category: '规范' | '图集';
}

const documents: DocumentItem[] = [
  // 规范 - 保留4个（去掉第一个和最后一个）
  { id: 'g2', code: 'GB50176-2016', title: '民用建筑热工设计规范', category: '规范' },
  { id: 'g3', code: 'GB50340-2016', title: '老年人居住建筑设计规范', category: '规范' },
  { id: 'g4', code: 'GB51192-2016', title: '公园设计规范', category: '规范' },
  { id: 'g5', code: 'JGJ48-2014', title: '商店建筑设计规范', category: '规范' },
  // 图集 - 保留5个
  { id: 't1', code: '00SJ202', title: '建筑坡屋面构造', category: '图集' },
  { id: 't3', code: '23G101-2', title: '混凝土结构施工图楼梯', category: '图集' },
  { id: 't4', code: '20G101-3', title: '混凝土结构施工图基础', category: '图集' },
  { id: 't5', code: '22G101-4', title: '混凝土结构施工图剪力墙', category: '图集' },
  { id: 't6', code: '18J903-1', title: '无障碍设计', category: '图集' },
];

interface DocumentGridProps {
  activeCategory?: '规范' | '图集';
  selectedId?: string;
  onSelect?: (id: string) => void;
  customDocs?: DocumentItem[];
}

export default function DocumentGrid({ activeCategory = '规范', selectedId, onSelect, customDocs = [] }: DocumentGridProps) {
  const filteredDocs = [...documents.filter((doc) => doc.category === activeCategory), ...customDocs];

  return (
    <section className="py-4">
      {/* Document List - 3 columns */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onSelect?.(doc.id)}
            className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
              selectedId === doc.id
                ? 'border-destructive/30 bg-destructive/10'
                : 'border-border bg-card'
            }`}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
              selectedId === doc.id
                ? 'bg-destructive/20 text-destructive'
                : 'bg-destructive/10 text-destructive'
            }`}>
              {doc.category === '规范' ? '规' : '图'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{doc.title}</p>
              {doc.code && (
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{doc.code}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
