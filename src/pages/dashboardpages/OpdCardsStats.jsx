import React from "react";
import CountUp from "react-countup";

const OpdCardsStats = ({ totalPatients=0, totalRev=0 }) => {
  
  return (
    <>
      {/* 🎨 Styles */}
      <style>{`
        /* 🔥 wrapper for animation */
        .stat-anim {
          opacity: 0;
          animation: fadeSlideUp 0.6s ease forwards;
        }

        /* stagger delay */
        .col-md-3:nth-child(1) .stat-anim { animation-delay: 0.1s; }
        .col-md-3:nth-child(2) .stat-anim { animation-delay: 0.2s; }
        .col-md-3:nth-child(3) .stat-anim { animation-delay: 0.3s; }
        .col-md-3:nth-child(4) .stat-anim { animation-delay: 0.4s; }

        .stat-card {
          border-radius: 20px;
          padding: 18px;
          color: white;
          position: relative;
          overflow: hidden;
          height: 140px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          transition: 0.3s;
        }

        /* ✅ hover now works properly */
        .stat-card:hover {
          transform: translateY(-6px) scale(1.03);
        }

        .stat-title {
          font-size: 13px;
          opacity: 0.9;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          margin-top: 6px;
        }

        /* 🔥 floating circles */
        .stat-circle {
          position: absolute;
          right: -40px;
          top: -40px;
          width: 140px;
          height: 140px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .stat-circle-2 {
          position: absolute;
          right: 20px;
          bottom: -40px;
          width: 100px;
          height: 100px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite;
        }

        .stat-footer {
          position: absolute;
          bottom: 12px;
          left: 18px;
          font-size: 11px;
          opacity: 0.8;
          letter-spacing: 1px;
        }

        /* 🔥 keyframes */
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      <div className="row g-4 mt-2">
        {/* TOTAL VISIT */}
        <div className="col-md-3">
          <div className="stat-anim">
            <div
              className="stat-card"
              style={{
                background: "linear-gradient(135deg, #3aa0ff, #2a7de1)",
              }}
            >
              <div className="stat-circle"></div>
              <div className="stat-circle-2"></div>

              <div className="stat-title">TOTAL Visit</div>

              <div className="stat-value">
                <CountUp end={totalPatients } duration={1.2} />
              </div>

              {/* <div className="stat-footer">**** **** **** 1234</div> */}
            </div>
          </div>
        </div>

        {/* OPD */}
        <div className="col-md-3">
          <div className="stat-anim">
            <div
              className="stat-card"
              style={{
                background: "linear-gradient(135deg, #7b2ff7, #5f1edc)",
              }}
            >
              <div className="stat-circle"></div>
              <div className="stat-circle-2"></div>

              <div className="stat-title">Total Revenue</div>

              <div className="stat-value">
                {totalRev>0 &&  <>₹ <CountUp end={totalRev} duration={1.2}/></>}  
                
              </div>

              {/* <div className="stat-footer">**** **** **** 5678</div> */}
            </div>
          </div>
        </div>

        {/* INSURED */}
        <div className="col-md-3">
          <div className="stat-anim">
            <div
              className="stat-card"
              style={{
                background: "linear-gradient(135deg, #ff4e50, #c0392b)",
              }}
            >
              <div className="stat-circle"></div>
              <div className="stat-circle-2"></div>

              <div className="stat-title">INSURED PATIENTS</div>

              <div className="stat-value">
                {/* <CountUp end={response.insured || 0} duration={1.2} /> */}
              </div>

              {/* <div className="stat-footer">**** **** **** 8899</div> */}
            </div>
          </div>
        </div>

        {/* REVENUE */}
        {/* <div className="col-md-3">
          <div className="stat-anim">
            <div
              className="stat-card"
              style={{
                background: "linear-gradient(135deg, #00c9a7, #00b894)",
              }}
            >
              <div className="stat-circle"></div>
              <div className="stat-circle-2"></div>

              <div className="stat-title">TOTAL REVENUE</div>

              <div className="stat-value">
                ₹<CountUp end={response.totalPatients || 0} duration={1.2} />
              </div>

              <div className="stat-footer">**** **** **** 4321</div>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default OpdCardsStats;