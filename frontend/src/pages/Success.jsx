import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Success() {
  const navigate = useNavigate();

  useEffect(() => {
    // Premium Success Popup
    Swal.fire({
      title: 'Payment Successful! ',
      text: 'TaskMatrix Pro activated. Enjoy your enhanced experience!',
      icon: 'success',
      confirmButtonColor: '#facc15',
      confirmButtonText: 'Let’s Go to Dashboard',
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="container" style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000'}}>
      <div className="card" style={{textAlign: 'center', padding: '40px', borderRadius: '20px', background: '#fff'}}>
        <h2 style={{marginBottom: '10px'}}>Processing...</h2>
        <p>Updating your pro status, please wait.</p>
      </div>
    </div>
  );
}

export default Success;