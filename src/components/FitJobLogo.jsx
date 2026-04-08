export default function FitJobLogo({ className = "" }) {
  return (
    <span className={`fitjob-wordmark ${className}`.trim()} aria-label="FITJOB">
      <span className="fitjob-wordmark-fit">FIT</span>
      <span className="fitjob-wordmark-job">JOB</span>
    </span>
  );
}
