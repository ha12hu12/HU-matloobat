import Sheet from './Sheet.jsx'

export default function NewsSheet({ onClose }) {
  return (
    <Sheet onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <span className="seal" style={{ fontSize: 12.5 }}>✨ حصريًا 3 ميزات جديدة!!</span>
      </div>
      <h2 style={{ textAlign: 'center', marginTop: 14 }}>وش الجديد؟</h2>

      <div className="card" style={{ marginTop: 18, lineHeight: 1.9 }}>
        <p style={{ margin: 0 }}>
          📦 لا تخاف إنك تنسى طلبك أو تضيع عليك فلوسك! 💸
          <br />
          مع الميزات الجديدة، صار بإمكانك متابعة طلبك بكل سهولة 👀✨
        </p>
        <hr className="rule" />
        <p style={{ margin: 0 }}>
          🙋‍♂️ هل استلمت طلبك؟
          <br />
          أو إذا كنت المندوب 🛵،
          <br />
          💰 هل استلمت فلوسك من مقدم الطلب؟
        </p>
        <hr className="rule" />
        <p style={{ margin: 0 }}>
          الآن ما تحتاج تتذكر أو تحتار! 🤩
          <br />
          بكبسة زر واحدة ☝️ تحل المشكلة وتحدد حالة الطلب بكل وضوح ✅
        </p>
      </div>

      <div className="card" style={{ marginTop: 12, lineHeight: 1.9 }}>
        <p style={{ margin: 0, fontWeight: 700 }}>💰 ميزة السعر الإجمالي</p>
        <hr className="rule" />
        <p style={{ margin: 0 }}>
          تعرض لك مجموع أسعار جميع الطلبات الموجودة في القائمة الواحدة، حتى تعرف قيمة القائمة
          كاملة في لمحة واحدة 📋✨
        </p>
      </div>

      <button className="btn btn-gold btn-block" style={{ marginTop: 18 }} onClick={onClose}>
        تم، فهمت 👍
      </button>
    </Sheet>
  )
}
