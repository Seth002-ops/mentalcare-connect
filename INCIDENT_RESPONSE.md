# Incident Response Runbook

## If You Detect a Breach

### Immediate Actions (First 15 Minutes)
1. **Rotate all secrets** in Render, Supabase, and your email
2. **Disable compromised accounts** via admin panel
3. **Check Render logs** for unusual API calls
4. **Check Supabase logs** for unusual queries

### Investigation (Next 2 Hours)
1. Review failed login attempts in Render logs
2. Check for unusual user creation patterns
3. Review recent booking and payment activity
4. Check if any therapist licenses were accessed

### Communication (Within 24 Hours)
1. Notify affected users if their data was exposed
2. Report to Kenya ODPC if health data was compromised
3. Update security.txt with incident details if needed

## Contact for Security Reports
- Email: admin@mecac.co.ke
- See: https://mecac-backend.onrender.com/.well-known/security.txt