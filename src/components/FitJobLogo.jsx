export default function FitJobLogo({ className = "", height = "22px" }) {
  return (
    <img 
      src="/FitJob2.png" 
      alt="FITJOB" 
      className={className} 
      style={{ height, width: "auto" }} 
    />
  );
}
