import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import type { StudentResponse } from "../../../interfaces/student/StudentResponse";

interface MyQrModalProps {
  student: StudentResponse;
  onClose: () => void;
}

const QR_EVENT_ID = "69b77e05f4f331e89e9494e7";
const QR_CAMPUS = "UC-Main";
const QR_COURSE = "BSCS";

const buildStudentName = (student: StudentResponse) =>
  [
    student.user.firstName,
    student.user.middleName?.trim(),
    student.user.lastName,
  ]
    .filter(Boolean)
    .join(" ");

const MyQrModal = ({ student, onClose }: MyQrModalProps) => {
  const payload = {
    v: 2,
    eventId: QR_EVENT_ID,
    studentId: student.studentId,
    name: buildStudentName(student),
    campus: QR_CAMPUS,
    course: QR_COURSE,
    year: student.yearLevel,
  };

  const qrValue = JSON.stringify(payload);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#170657] shadow-2xl sm:max-w-md"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <div>
              <h2 className="text-base font-bold text-white sm:text-lg">
                My QR
              </h2>
              <p className="mt-1 text-xs text-white/45 sm:text-sm">
                Show this code when asked during the event.
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.03] p-4 sm:mb-5">
            <p className="truncate text-sm font-semibold text-white">
              {payload.name}
            </p>
            <p className="mt-1 text-xs text-white/45">
              {payload.studentId} · {payload.course} · Year {payload.year}
            </p>
          </div>

          <div className="flex flex-col items-center py-2">
            <div className="rounded-xl bg-white p-2 sm:p-2.5">
              <QRCodeCanvas
                value={qrValue}
                size={280}
                level="L"
                marginSize={4}
                style={{
                  imageRendering: "pixelated",
                  width: "100%",
                  height: "auto",
                  maxWidth: "280px",
                }}
              />
            </div>

            <p className="mt-4 max-w-[260px] text-center text-xs text-white/45 sm:text-sm">
              Encodes your student event payload for attendance use.
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-5 w-full rounded-xl bg-white/5 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MyQrModal;
