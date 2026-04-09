export default function FitJobLogo({ className = "", height = "32px" }) {
  return (
    <img 
      src="/logo.png" 
      alt="FITJOB" 
      className={className} 
      style={{ height, width: "auto" }} 
    />
  );
}
