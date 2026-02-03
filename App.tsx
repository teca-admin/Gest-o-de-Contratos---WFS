
import React, { useState, useEffect, useMemo } from 'react';
import { PurchaseRecord, Category } from './types.ts';
import { INITIAL_BASES, CATEGORIES, APP_CONFIG } from './constants.ts';
import { Input, Select, DatePicker } from './components/Input.tsx';
import { Modal } from './components/Modal.tsx';

const App: React.FC = () => {
  const [records, setRecords] = useState<PurchaseRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PurchaseRecord>>({
    fornecedor: '',
    categoria: undefined,
    base: '',
    documento: '',
    descricao: '',
    pedido: '',
    valor: 0,
    vencimento: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('base_spend_records');
    if (saved) {
      try { setRecords(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('base_spend_records', JSON.stringify(records));
  }, [records]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fornecedor || !formData.categoria || !formData.base || !formData.valor || !formData.vencimento) return;

    const newRecord: PurchaseRecord = {
      ...(formData as PurchaseRecord),
      id: crypto.randomUUID(),
      valor: Number(formData.valor),
      createdAt: new Date().toISOString()
    };

    setRecords(prev => [newRecord, ...prev]);
    setFormData({ fornecedor: '', categoria: undefined, base: '', documento: '', descricao: '', pedido: '', valor: 0, vencimento: '' });
    setIsModalOpen(false);
  };

  const deleteRecord = (id: string) => {
    if (confirm("Deseja realmente remover este registro estratégico?")) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const summaries = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    records.forEach(r => {
      const current = map.get(r.base) || { total: 0, count: 0 };
      map.set(r.base, { total: current.total + r.valor, count: current.count + 1 });
    });
    return Array.from(map.entries()).map(([base, stats]) => ({ base, ...stats }));
  }, [records]);

  const totalGeral = records.reduce((acc, curr) => acc + curr.valor, 0);

  const formatCurrency = (val: number) => 
    val.toLocaleString(APP_CONFIG.LOCALE, { style: 'currency', currency: APP_CONFIG.CURRENCY });

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permite apenas números, um único ponto ou vírgula
    const rawValue = e.target.value;
    const sanitized = rawValue.replace(/[^0-9.,]/g, '').replace(',', '.');
    
    // Garante que só existe um ponto decimal
    const parts = sanitized.split('.');
    const finalValue = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : sanitized;
    
    setFormData(f => ({ ...f, valor: finalValue === '' ? 0 : finalValue as any }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Executive Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 flex items-center justify-center text-white shadow-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">Gestão de Contratos</h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">WFS CORPORATE</span>
            </div>
          </div>
          
          <div className="flex items-center gap-10">
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-right border-r border-slate-100 pr-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Budget Alocado</p>
                <p className="text-xl font-extrabold text-slate-900">{formatCurrency(totalGeral)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Volume Operacional</p>
                <p className="text-xl font-extrabold text-indigo-600">{records.length} <span className="text-[11px] font-medium text-slate-400">lançamentos</span></p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 transition-all shadow-xl shadow-slate-200 flex items-center gap-2 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Lançamento
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 py-10 space-y-10">
        
        {/* KPI Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 uppercase">Monitoramento Real-time</span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Custo Global Consolidade</p>
            <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(totalGeral)}</p>
          </div>

          {summaries.map((s) => (
            <div key={s.base} className="bg-white p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-indigo-500">
              <div className="flex justify-between items-center mb-4">
                <span className="w-10 h-10 bg-slate-50 flex items-center justify-center font-black text-slate-600 text-[11px]">{s.base}</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase">{s.count} transações</span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unidade Operacional</p>
              <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(s.total)}</p>
            </div>
          ))}
        </section>

        {/* Intelligence Table */}
        <section className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Registro Geral de Ativos</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Consolidação de contratos e compras auditadas com rastreabilidade total.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse table-fixed min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase font-black tracking-widest align-middle">
                  <th className="px-6 py-5 w-[16%] text-center">FORNECEDOR</th>
                  <th className="px-6 py-5 w-[12%] text-center">CATEGORIA</th>
                  <th className="px-6 py-5 w-[12%] text-center">BASE</th>
                  <th className="px-6 py-5 w-[12%] text-center">REFERÊNCIA DO DOCUMENTO</th>
                  <th className="px-6 py-5 w-[12%] text-center">DESCRIÇÃO</th>
                  <th className="px-6 py-5 w-[12%] text-center">PEDIDO</th>
                  <th className="px-6 py-5 w-[12%] text-center">VALOR</th>
                  <th className="px-6 py-5 w-[12%] text-center">VENCIMENTO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-8 py-32 text-center">
                       <div className="flex flex-col items-center gap-3 opacity-30">
                          <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                          </svg>
                          <p className="text-[11px] font-bold">Aguardando novos lançamentos operacionais WFS</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-all group align-middle">
                      <td className="px-6 py-6 text-center">
                        <div className="font-bold text-slate-900 text-[11px] truncate uppercase tracking-tight mx-auto max-w-full" title={record.fornecedor}>
                          {record.fornecedor}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`
                          text-[11px] font-black px-2.5 py-1 uppercase tracking-widest border inline-block w-full text-center
                          ${record.categoria === Category.LOCACAO ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : ''}
                          ${record.categoria === Category.MATERIAL ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}
                          ${record.categoria === Category.SERVICO ? 'bg-amber-50 text-amber-700 border-amber-100' : ''}
                        `}>
                          {record.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="inline-flex px-3 py-1 bg-slate-900 text-white text-[11px] font-black tracking-tighter">
                          {record.base}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="text-[11px] font-bold text-slate-500 break-all">
                          {record.documento || <span className="text-slate-200">SEM REF.</span>}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="text-[11px] text-slate-500 leading-relaxed italic line-clamp-2" title={record.descricao}>
                          {record.descricao || 'Nenhuma descrição técnica informada'}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                         <div className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 inline-block rounded-sm">
                           #{record.pedido || '---'}
                         </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="text-[11px] font-black text-slate-900">
                          {formatCurrency(record.valor)}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="text-[11px] font-bold text-slate-900">
                          {new Date(record.vencimento).toLocaleDateString(APP_CONFIG.LOCALE)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium uppercase">Previsão</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Novo Registro Analítico - WFS"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <Input 
            label="FORNECEDOR"
            value={formData.fornecedor}
            onChange={e => setFormData(f => ({ ...f, fornecedor: e.target.value }))}
            placeholder="Razão Social ou Nome Fantasia"
            required
          />

          <div className="grid grid-cols-2 gap-6">
            <Select 
              label="CATEGORIA"
              options={CATEGORIES}
              value={formData.categoria}
              onChange={e => setFormData(f => ({ ...f, categoria: e.target.value as Category }))}
              required
            />
            <Select 
              label="BASE"
              options={INITIAL_BASES}
              value={formData.base}
              onChange={e => setFormData(f => ({ ...f, base: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Referência do Documento"
              value={formData.documento}
              onChange={e => setFormData(f => ({ ...f, documento: e.target.value }))}
              placeholder="N. Nota Fiscal ou Boleto"
            />
            <Input 
              label="PEDIDO"
              type="text"
              maxLength={6}
              value={formData.pedido}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData(f => ({ ...f, pedido: val }));
              }}
              placeholder="ID de 6 dígitos"
            />
          </div>

          <Input 
            label="DESCRIÇÃO"
            value={formData.descricao}
            onChange={e => setFormData(f => ({ ...f, descricao: e.target.value }))}
            placeholder="Breve resumo da finalidade deste gasto..."
          />

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="VALOR"
              type="text"
              inputMode="decimal"
              prefix="R$"
              value={formData.valor || ''}
              onChange={handleValorChange}
              placeholder="0,00"
              required
            />
            <DatePicker 
              label="VENCIMENTO"
              value={formData.vencimento}
              onChange={e => setFormData(f => ({ ...f, vencimento: e.target.value }))}
              required
            />
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 text-slate-500 font-bold py-4 hover:bg-slate-50 transition-all border border-transparent"
            >
              Descartar
            </button>
            <button 
              type="submit"
              className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 transition-all shadow-xl shadow-indigo-100 text-lg active:scale-95"
            >
              Confirmar Lançamento
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default App;
