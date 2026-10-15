const form = document.getElementById('orderForm');
const drink = document.getElementById('drink');
const quantity = document.getElementById('quantity');
const totalPrice = document.getElementById('totalPrice');
const priceBreakdown = document.getElementById('priceBreakdown');
const historyModal = document.getElementById('historyModal');
const historyList = document.getElementById('historyList');
const historyCount = document.getElementById('historyCount');
const toast = document.getElementById('toast');
const submitButton = form.querySelector('button[type="submit"]');
let orders = [];
const config = window.SUPABASE_CONFIG || {};
const supabaseReady = window.supabase && config.url && config.publishableKey && !config.url.includes('YOUR_PROJECT') && !config.publishableKey.includes('YOUR_SUPABASE');
const supabaseClient = supabaseReady ? window.supabase.createClient(config.url, config.publishableKey) : null;
const won = n => `${n.toLocaleString('ko-KR')}`;
function getOrderPrice() {
  const drinkPrice = Number(drink.selectedOptions[0]?.dataset.price || 0);
  const sizeInput = form.querySelector('input[name="size"]:checked');
  const sizePrice = Number(sizeInput?.dataset.price || 0);
  const optionInputs = [...form.querySelectorAll('input[name="option"]:checked')];
  const optionsPrice = optionInputs.reduce((sum, input) => sum + Number(input.dataset.price || 0), 0);
  const qty = Math.max(1, Math.min(20, Number(quantity.value) || 1));
  return { drinkPrice, sizePrice, optionsPrice, qty, unit: drinkPrice + sizePrice + optionsPrice, total: (drinkPrice + sizePrice + optionsPrice) * qty };
}
function updateTotal() {
  const p = getOrderPrice();
  totalPrice.innerHTML = `${won(p.total)}<span>원</span>`;
  priceBreakdown.textContent = drink.value ? `1잔 ${won(p.unit)}원 × ${p.qty}잔` : '음료를 선택해주세요';
  document.querySelectorAll('.choice').forEach(label => label.classList.toggle('selected', label.querySelector('input').checked));
}
function showToast(message) {
  toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2800);
}
function syncHistoryCount() { historyCount.textContent = orders.length; }
function openHistory() { renderHistory(); historyModal.hidden = false; document.getElementById('closeHistory').focus(); }
function closeHistory() { historyModal.hidden = true; }
function renderHistory() {
  if (!orders.length) { historyList.innerHTML = '<div class="empty-history">아직 이 페이지에서 접수한 주문이 없어요.<br>주문 내역은 현재 페이지가 열린 동안만 표시됩니다 ☕</div>'; return; }
  historyList.innerHTML = orders.slice().reverse().map(order => `<article class="history-item"><div class="history-item-top"><b>${escapeHtml(order.drink)} · ${escapeHtml(order.size)} 사이즈</b><strong>${won(order.total)}원</strong></div><div class="history-detail">${order.qty}잔${order.options.length ? ` · ${order.options.map(escapeHtml).join(', ')}` : ''}${order.request ? `<br>요청사항: ${escapeHtml(order.request)}` : ''}</div><div class="history-meta">${escapeHtml(order.name)}${order.phone ? ` · ${escapeHtml(order.phone)}` : ''} · ${order.time}</div></article>`).join('');
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
form.addEventListener('input', updateTotal); form.addEventListener('change', updateTotal);
document.getElementById('minusQty').addEventListener('click', () => { quantity.value = Math.max(1, (Number(quantity.value) || 1) - 1); updateTotal(); });
document.getElementById('plusQty').addEventListener('click', () => { quantity.value = Math.min(20, (Number(quantity.value) || 1) + 1); updateTotal(); });
quantity.addEventListener('change', () => { quantity.value = Math.max(1, Math.min(20, Number(quantity.value) || 1)); updateTotal(); });
form.addEventListener('submit', async event => {
  event.preventDefault(); if (!form.reportValidity()) return;
  if (!drink.value) { drink.focus(); showToast('음료를 먼저 선택해주세요.'); return; }
  if (!supabaseClient) { showToast('Supabase 설정을 먼저 완료해주세요. supabase-config.js를 확인하세요.'); return; }
  const p = getOrderPrice();
  const options = [...form.querySelectorAll('input[name="option"]:checked')].map(input => input.value);
  const order = { name: document.getElementById('customerName').value.trim(), phone: document.getElementById('phone').value.trim(), drink: drink.value, size: form.querySelector('input[name="size"]:checked').value, options, qty: p.qty, request: document.getElementById('request').value.trim(), unit: p.unit, total: p.total, time: new Date().toLocaleString('ko-KR', {month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}) };
  submitButton.disabled = true; submitButton.textContent = '저장 중...';
  try {
    const { error } = await supabaseClient.from('orders').insert({ customer_name: order.name, phone: order.phone || null, drink: order.drink, size: order.size, options: order.options, quantity: order.qty, request: order.request || null, unit_price: order.unit, total_price: order.total });
    if (error) throw error;
    orders.push(order); syncHistoryCount(); showToast(`${order.name}님, 주문이 Supabase에 저장되었어요! ☕`);
    form.reset(); quantity.value = 1; updateTotal(); window.scrollTo({top: 0, behavior: 'smooth'});
  } catch (error) { console.error('Supabase 주문 저장 실패:', error); showToast(`저장 실패: ${error.message || '설정과 테이블/RLS 정책을 확인해주세요.'}`); }
  finally { submitButton.disabled = false; submitButton.innerHTML = '주문하기 <span>→</span>'; }
});
document.getElementById('resetForm').addEventListener('click', () => { form.reset(); quantity.value = 1; updateTotal(); showToast('주문서를 처음 상태로 되돌렸어요.'); });
document.getElementById('showHistory').addEventListener('click', openHistory);
document.getElementById('closeHistory').addEventListener('click', closeHistory);
document.getElementById('doneHistory').addEventListener('click', closeHistory);
historyModal.addEventListener('click', event => { if (event.target === historyModal) closeHistory(); });
document.getElementById('clearHistory').addEventListener('click', () => { if (!orders.length) { showToast('비울 주문 내역이 없어요.'); return; } orders = []; syncHistoryCount(); renderHistory(); showToast('현재 화면의 주문 내역을 비웠어요. Supabase에 저장된 데이터는 삭제되지 않았어요.'); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !historyModal.hidden) closeHistory(); });
updateTotal();
