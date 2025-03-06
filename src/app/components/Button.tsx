const SubmitButton: React.FC<{ text: string; isLoading?: boolean; icon?: React.ReactNode; className:string; }> = ({ text, isLoading, icon , className }) => (
    <button
      type="submit"
      className={className}
      disabled={isLoading}
    >
      {isLoading ? 'Processing...' : text}
    </button>
  );

  export default SubmitButton;