const CopyrightFooter = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-4 shadow-inner border-t border-white/10">
      <div className="container mx-auto px-4">
        <p className="text-sm">
          © {new Date().getFullYear()}{' '}
          <span className="font-semibold bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
            Expressly
          </span>
          . All rights reserved
        </p>
        <p className="text-xs text-indigo-200 mt-1">
          Empowering communication excellence
        </p>
      </div>
    </footer>
  );
};

export default CopyrightFooter;