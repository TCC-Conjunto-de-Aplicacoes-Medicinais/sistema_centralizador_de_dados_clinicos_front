"use client";

import ClinicalDocumentSheet from "./ClinicalDocumentSheet";
import { Clinic, ClinicUser, AuthorizedHistory } from "../app/mockData";

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorizedHistory: AuthorizedHistory | null;
  currentClinic: Clinic;
  currentUser: ClinicUser;
}

export default function PrintPreviewModal({
  isOpen,
  onClose,
  authorizedHistory,
  currentClinic,
  currentUser,
}: PrintPreviewModalProps) {
  if (!isOpen || !authorizedHistory) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:relative print:inset-auto">
      <div className="relative bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none">
        {/* Modal Actions Bar (hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-emerald-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 19.128s.18-.716.595-1.12c.414-.405 1.1-.405 1.1-.405h6.17s.685 0 1.1.405c.414.404.595 1.12.595 1.12M15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-sm">Visualização de Sumário Clínico (Imprimir / PDF)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 font-bold px-4 py-2 rounded text-xs transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 19.128s.18-.716.595-1.12c.414-.405 1.1-.405 1.1-.405h6.17s.685 0 1.1.405c.414.404.595 1.12.595 1.12M12 3v13.5m0 0L8.25 12.75M12 16.5l3.75-3.75" />
              </svg>
              Imprimir Documento
            </button>
            <button
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 font-bold px-3 py-2 rounded text-xs transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Simulated Sheet Paper */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white print:p-0 print:overflow-visible">
          <div className="max-w-3xl mx-auto border border-slate-300 p-8 rounded shadow-sm bg-white print:border-0 print:p-0 print:shadow-none">
            <ClinicalDocumentSheet
              history={authorizedHistory}
              currentClinic={currentClinic}
              currentUser={currentUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
