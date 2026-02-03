
import React, { useState, useEffect, useMemo } from 'react';
import { PurchaseRecord, Category } from './types';
import { INITIAL_BASES, CATEGORIES, APP_CONFIG } from './constants';
import { Input, Select } from './components/Input';
import { Modal } from './components/Modal';

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
                <p className="text-xl font-extrabold text-indigo-600">{records.length} <span className="text-xs font-medium text-slate-400">lançamentos</span></p>
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
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 uppercase">Monitoramento Real-time</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Custo Global Consolidade</p>
            <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(totalGeral)}</p>
          </div>

          {summaries.map((s) => (
            <div key={s.base} className="bg-white p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-indigo-500">
              <div className="flex justify-between items-center mb-4">
                <span className="w-10 h-10 bg-slate-50 flex items-center justify-center font-black text-slate-600 text-sm">{s.base}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{s.count} transações</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Unidade Operacional</p>
              <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(s.total)}</p>
            </div>
          ))}
        </section>

        {/* Intelligence Table */}
        <section className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Registro Geral de Ativos</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Consolidação de contratos e compras auditadas.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records));
                  const a = document.createElement('a');
                  a.href = dataStr; a.download = "wfs_gestao_audit.json";
                  a.click();
                }}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar Audit
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-8 py-5">Vencimento</th>
                  <th className="px-8 py-5">Unidade / Base</th>
                  <th className="px-8 py-5">Fornecedor & Detalhamento</th>
                  <th className="px-8 py-5">Documentação</th>
                  <th className="px-8 py-5">Classificação</th>
                  <th className="px-8 py-5 text-right">Montante</th>
                  <th className="px-8 py-5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-32 text-center">
                       <div className="flex flex-col items-center gap-3 opacity-30">
                          <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                          </svg>
                          <p className="text-lg font-bold">Aguardando novos lançamentos operacionais WFS</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-slate-900">
                          {new Date(record.vencimento).toLocaleDateString(APP_CONFIG.LOCALE)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Data limite</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex px-3 py-1 bg-slate-900 text-white text-[10px] font-black">
                          {record.base}
                        </span>
                      </td>
                      <td className="px-8 py-6 max-w-sm">
                        <div className="font-bold text-slate-900 text-sm truncate">{record.fornecedor}</div>
                        <div className="text-xs text-slate-400 truncate font-medium">{record.descricao || 'Sem descrição analítica'}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-[10px] font-bold space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <span className="w-8 opacity-40">DOC</span> {record.documento || '---'}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-8 opacity-40">PED</span> {record.pedido || '---'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`
                          text-[9px] font-black px-3 py-1.5 uppercase tracking-widest border
                          ${record.categoria === Category.LOCACAO ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : ''}
                          ${record.categoria === Category.MATERIAL ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}
                          ${record.categoria === Category.SERVICO ? 'bg-amber-50 text-amber-700 border-amber-100' : ''}
                        `}>
                          {record.categoria}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-base font-extrabold text-slate-900">
                          {formatCurrency(record.valor)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button 
                          onClick={() => deleteRecord(record.id)}
                          className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modern High-End Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Novo Registro Analítico - WFS"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <Input 
            label="Provedor de Serviço / Fornecedor"
            value={formData.fornecedor}
            onChange={e => setFormData(f => ({ ...f, fornecedor: e.target.value }))}
            placeholder="Razão Social ou Nome Fantasia"
            required
          />

          <div className="grid grid-cols-2 gap-6">
            <Select 
              label="Classificação de Ativo"
              options={CATEGORIES}
              value={formData.categoria}
              onChange={e => setFormData(f => ({ ...f, categoria: e.target.value as Category }))}
              required
            />
            <Select 
              label="Unidade de Negócio (Base)"
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
              label="Protocolo de Pedido"
              type="text"
              maxLength={6}
              pattern="\d{6}"
              value={formData.pedido}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData(f => ({ ...f, pedido: val }));
              }}
              placeholder="ID de 6 dígitos"
            />
          </div>

          <Input 
            label="Contexto do Investimento"
            value={formData.descricao}
            onChange={e => setFormData(f => ({ ...f, descricao: e.target.value }))}
            placeholder="Breve resumo da finalidade deste gasto..."
          />

          <div className="grid grid-cols-2 gap-6">
            <Input 
              label="Montante Financeiro (R$)"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={e => setFormData(f => ({ ...f, valor: Number(e.target.value) }))}
              required
            />
            <Input 
              label="Data Prevista de Vencimento"
              type="date"
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
