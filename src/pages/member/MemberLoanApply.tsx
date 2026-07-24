import { useOutletContext, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function MemberLoanApply() {
  const { member } = useOutletContext<{ member: any }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [eligibleGuarantors, setEligibleGuarantors] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState('');
  const [guarantor1, setGuarantor1] = useState('');
  const [guarantor2, setGuarantor2] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/members/loans/metadata').then(res => res.json()).then(data => {
      setProducts(data.products);
      setEligibleGuarantors(data.eligibleGuarantors);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    const amountKobo = parseInt(amount) * 100;
    if (amountKobo < selectedProduct.minAmountKobo || amountKobo > selectedProduct.maxAmountKobo) {
      toast.error('Amount is outside the allowed range for this product.');
      return;
    }

    const guarantors = [guarantor1, guarantor2].filter(Boolean);
    if (guarantors.length < selectedProduct.requiredGuarantors) {
      toast.error(`This loan requires ${selectedProduct.requiredGuarantors} guarantor(s).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/members/loans/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          amountKobo,
          termMonths: parseInt(term),
          guarantors
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Loan application submitted! Ref: ${data.reference}`);
        navigate('/member/loans');
      } else {
        toast.error(data.error || 'Failed to submit application');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 md:pb-0">
      <header>
        <h1 className="text-2xl font-bold text-seed-950">Apply for a Loan</h1>
        <p className="text-ink-600 mt-1">Select a product and submit your application for review.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-[14px] p-6 border border-ink-200 shadow-sm space-y-8">
        <section>
          <h3 className="font-semibold text-seed-950 mb-4">1. Select Loan Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map(p => (
              <div 
                key={p.id} 
                onClick={() => { setSelectedProduct(p); setTerm(p.maxTermMonths.toString()); }}
                className={`p-4 border rounded-[10px] cursor-pointer transition-colors ${selectedProduct?.id === p.id ? 'border-seed-500 bg-seed-50 ring-1 ring-seed-500' : 'border-ink-200 hover:border-seed-300'}`}
              >
                <div className="font-medium text-sm text-seed-950 mb-2">{p.name}</div>
                <div className="text-xs text-ink-600 space-y-1">
                  <p>Up to ₦{(p.maxAmountKobo / 100).toLocaleString()}</p>
                  <p>{p.interestRate * 100}% Interest</p>
                  <p>{p.maxTermMonths} Months Max</p>
                  <p>{p.requiredGuarantors} Guarantor(s)</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedProduct && (
          <section className="space-y-4">
            <h3 className="font-semibold text-seed-950 mb-4">2. Loan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Requested Amount (₦)</label>
                <input 
                  type="number" 
                  required 
                  min={selectedProduct.minAmountKobo / 100} 
                  max={selectedProduct.maxAmountKobo / 100}
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  className="w-full px-3 py-2 border border-ink-200 rounded-[8px] focus:ring-2 focus:ring-seed-500 outline-none" 
                />
                <p className="text-xs text-ink-500 mt-1">Min: ₦{(selectedProduct.minAmountKobo/100).toLocaleString()} - Max: ₦{(selectedProduct.maxAmountKobo/100).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Term (Months)</label>
                <input 
                  type="number" 
                  required 
                  min={1} 
                  max={selectedProduct.maxTermMonths}
                  value={term} 
                  onChange={e => setTerm(e.target.value)} 
                  className="w-full px-3 py-2 border border-ink-200 rounded-[8px] focus:ring-2 focus:ring-seed-500 outline-none" 
                />
              </div>
            </div>
            
            {amount && term && (
              <div className="bg-ivory-50 p-4 rounded-[8px] border border-ink-200 mt-4">
                <p className="text-sm font-medium text-seed-950">Estimated Repayment</p>
                <p className="text-xs text-ink-600 mt-1">
                  Principal: ₦{parseInt(amount).toLocaleString()} <br/>
                  Interest: ₦{Math.round(parseInt(amount) * selectedProduct.interestRate).toLocaleString()} <br/>
                  Total Due: ₦{Math.round(parseInt(amount) * (1 + selectedProduct.interestRate)).toLocaleString()}
                </p>
              </div>
            )}

            {selectedProduct.requiredGuarantors > 0 && (
              <div className="pt-4">
                <h3 className="font-semibold text-seed-950 mb-4">3. Guarantors</h3>
                <p className="text-sm text-ink-600 mb-4">Select {selectedProduct.requiredGuarantors} member(s) to guarantee your loan.</p>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <select required value={guarantor1} onChange={e => setGuarantor1(e.target.value)} className="w-full px-3 py-2 border border-ink-200 rounded-[8px] outline-none focus:border-seed-500">
                      <option value="">Select Guarantor 1</option>
                      {eligibleGuarantors.map(g => (
                        <option key={g.id} value={g.id}>{g.firstName} {g.lastName} ({g.membershipNumber})</option>
                      ))}
                    </select>
                  </div>
                  {selectedProduct.requiredGuarantors > 1 && (
                    <div>
                      <select required value={guarantor2} onChange={e => setGuarantor2(e.target.value)} className="w-full px-3 py-2 border border-ink-200 rounded-[8px] outline-none focus:border-seed-500">
                        <option value="">Select Guarantor 2</option>
                        {eligibleGuarantors.filter(g => g.id !== guarantor1).map(g => (
                          <option key={g.id} value={g.id}>{g.firstName} {g.lastName} ({g.membershipNumber})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-6 flex justify-end gap-4 border-t border-ink-100">
              <button 
                type="button"
                onClick={() => navigate('/member/loans')}
                className="px-6 py-2.5 rounded-[10px] text-ink-600 hover:bg-ink-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-seed-800 text-white px-6 py-2.5 rounded-[10px] font-medium hover:bg-seed-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </section>
        )}
      </form>
    </div>
  );
}
