# 🚀 Pilot Ready Guide - AI Grading System

**Your AI-powered mathematics grading system is now wired to the frontend and ready for testing!**

---

## ✅ What's Ready

### Backend API (Port 8000)
- ✅ Answer Evaluation
- ✅ Misconception Detection
- ✅ Learning Pathway Generation
- ✅ All endpoints tested and working

### Frontend Pages (Port 3000)
- ✅ **AI Grading Page** - `/ai-grading`
- ✅ **Pathways Page** - `/pathways`
- ✅ Connected to backend API
- ✅ Ready for teacher use

---

## 🎯 How to Run Pilot Tomorrow

### Step 1: Start the System (5 minutes)

```bash
# Terminal 1: Start Backend
cd /Users/mosiams/Desktop/ETDP_SETA_Repo/backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Start Frontend
cd /Users/mosiams/Desktop/ETDP_SETA_Repo/frontend
npm run dev
```

**Access URLs:**
- Frontend: http://localhost:3001 (auto-selected because 3000 in use)
- AI Grading: http://localhost:3001/ai-grading
- Pathways: http://localhost:3001/pathways
- API Docs: http://localhost:8000/docs

---

### Step 2: Prepare Questions (10 minutes)

Create 5-10 CAPS-aligned mathematics questions for your grade level. Examples:

**Grade 5-6 Questions:**
1. "Solve: 3/4 + 1/2"
2. "Compare: 0.5 and 0.234. Which is larger?"
3. "What is 15% of 200?"
4. "Calculate: 10 ÷ 0.5"
5. "Which is larger: 1/3 or 1/5?"

**Have ready:**
- Question text
- Correct answer
- Paper assessments from learners

---

### Step 3: Collect Learner Answers (During Class)

**Option A: Paper-based (Recommended for first pilot)**
1. Give learners 5-10 questions on paper
2. Collect completed papers
3. You'll enter answers into system after class

**Option B: Direct entry**
1. Learners tell you their answers
2. You enter in real-time on `/ai-grading` page

---

### Step 4: Use AI Grading Page (15-30 minutes)

**Navigate to:** http://localhost:3001/ai-grading

**For each learner answer:**
1. Enter question content
2. Enter correct answer
3. Enter learner's answer
4. Select grade level
5. (Optional) Add show work
6. Click "Evaluate Answer"

**You'll see:**
- ✅ Score (0-10)
- ✅ Percentage
- ✅ Detailed feedback
- ✅ If wrong: Misconception detected
- ✅ Remediation strategy
- ✅ Time estimate to fix

**Quick Test Buttons:**
- Use "Sample Questions" buttons to test system
- Try before pilot to familiarize yourself

---

### Step 5: Review Results with Teacher (10 minutes)

**Key Questions:**
1. Does AI score match your judgment?
2. Is feedback helpful and appropriate?
3. Are misconceptions correctly identified?
4. Would you use this to save grading time?

**Document:**
- Accuracy: AI correct ___/10 evaluations
- Time saved: ___ minutes
- Teacher satisfaction: ___/10
- Would use again: Yes/No

---

### Step 6: (Optional) Generate Pathway

**For 1-2 struggling learners:**

1. Go to: http://localhost:3001/pathways
2. Enter:
   - Learner ID
   - Current skills (e.g., "counting, basic addition")
   - Target skills (e.g., "fractions, fraction operations")
   - Grade level
   - Timeframe (4-8 weeks)
3. Click "Generate Learning Pathway"
4. Wait 20-30 seconds
5. Review AI-generated weekly plan

**Check:**
- Are activities age-appropriate?
- Does progression make sense?
- Would you assign this to the learner?

---

## 📊 Data to Collect During Pilot

### Evaluation Accuracy
- Total questions evaluated: ___
- AI graded correctly: ___
- AI graded incorrectly: ___
- Accuracy percentage: ___%

### Misconception Detection
- Wrong answers analyzed: ___
- Misconceptions detected: ___
- Teacher agrees with detection: ___/___
- Detection accuracy: ___%

### Time Savings
- Time to grade 10 questions manually: ___ min
- Time to grade 10 with AI: ___ min
- Time saved per question: ___ min
- Projected weekly time saved: ___ hours

### Teacher Feedback
- Easy to use? (1-5): ___
- Feedback quality? (1-5): ___
- Would recommend? (Yes/No): ___
- Concerns/Issues: ___

### Cost Tracking
- Total evaluations: ___
- Total cost: $___
- Cost per evaluation: $___

---

## 💡 Tips for Successful Pilot

### Before Pilot:
1. ✅ Test with 2-3 sample questions yourself
2. ✅ Check both backends are running
3. ✅ Prepare questions in advance
4. ✅ Have scoring rubric ready for comparison
5. ✅ Brief teacher on what to expect

### During Pilot:
1. ✅ Start with correct answers to build confidence
2. ✅ Then try wrong answers to see misconception detection
3. ✅ Compare AI feedback to your own feedback
4. ✅ Note any surprising or incorrect evaluations
5. ✅ Track time spent on each step

### After Pilot:
1. ✅ Review data collected
2. ✅ Get teacher impressions
3. ✅ Calculate actual cost
4. ✅ Identify issues/improvements
5. ✅ Decide: expand pilot or adjust?

---

## 🎬 Quick Start Script (Use This!)

**5-Minute Pilot Test:**

1. **Start servers** (see Step 1 above)
2. **Go to** http://localhost:3001/ai-grading
3. **Click Sample Question 1** ("Solve: 3/4 + 1/2")
4. **Click "Evaluate Answer"**
5. **Review:** Score, feedback, cost
6. **Click Sample Question 2** (decimal comparison - wrong answer)
7. **Click "Evaluate Answer"**
8. **Review:** Misconception detected, remediation strategy
9. **Done!** You've tested the core functionality

**Expected Results:**
- Question 1: 10/10, positive feedback (~$0.00006)
- Question 2: 0/10, "Longer Decimal is Larger" misconception detected (~$0.00019)
- Total cost: <$0.001 (less than 1 cent)

---

## 📋 Pilot Checklist

### Pre-Pilot (Today)
- [ ] Test both sample questions on `/ai-grading`
- [ ] Verify backend API is accessible
- [ ] Prepare 5-10 CAPS questions
- [ ] Print data collection sheet
- [ ] Brief participating teacher

### During Pilot (Tomorrow)
- [ ] Collect 10-20 learner answers
- [ ] Enter into AI grading system
- [ ] Compare AI vs. manual grades
- [ ] Document accuracy
- [ ] Track time spent
- [ ] Note any issues

### Post-Pilot (Tomorrow PM)
- [ ] Calculate accuracy percentage
- [ ] Calculate time saved
- [ ] Get teacher feedback
- [ ] Review misconception detections
- [ ] Check actual costs
- [ ] Decide next steps

---

## 🔧 Troubleshooting

### Frontend won't load
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Backend errors
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Can't connect frontend to backend
- Check `http://localhost:8000/health` returns `{"status":"healthy"}`
- Check CORS is enabled (already configured)
- Check both servers running on correct ports

### API costs too high
- Expected: $0.0001 per evaluation
- If higher: Check token usage in logs
- Solution: Reduce `max_tokens` in backend `.env`

---

## 💰 Cost Expectations for Pilot

**10 learners × 5 questions = 50 evaluations**

| Item | Quantity | Cost Each | Total |
|------|----------|-----------|-------|
| Correct evaluations | 30 | $0.00006 | $0.002 |
| Wrong evaluations | 20 | $0.00010 | $0.002 |
| Misconception detections | 15 | $0.00019 | $0.003 |
| **Total** | | | **$0.007** |

**Your pilot will cost less than 1 cent!**

---

## 📞 Support During Pilot

### If something breaks:
1. Check backend logs (Terminal 1)
2. Check frontend logs (Terminal 2)
3. Restart servers if needed
4. Check `/health` endpoint
5. Review error messages carefully

### Common Issues:
- **"API request failed"**: Backend not running
- **"OpenAI error"**: Check API key in `.env`
- **Slow responses**: Normal for first request (cold start)
- **Wrong evaluation**: Document for review

---

## 🎯 Success Criteria

**Pilot is successful if:**
- ✅ 80%+ evaluation accuracy
- ✅ Teacher finds it useful
- ✅ Saves 5+ minutes per 10 questions
- ✅ Misconceptions correctly identified
- ✅ No major technical issues
- ✅ Cost <$0.01 for full pilot

**Next Steps if Successful:**
1. Expand to 50-100 learners
2. Add more grade levels
3. Train more teachers
4. Build additional features

**Next Steps if Issues:**
1. Review what went wrong
2. Adjust prompts/settings
3. Re-test with different questions
4. Iterate and try again

---

## 📚 Additional Resources

**Documentation:**
- Full API docs: http://localhost:8000/docs
- Implementation summary: `FINAL_AI_IMPLEMENTATION.md`
- Test results: `API_TEST_RESULTS.md`

**Frontend Pages:**
- Home: http://localhost:3001
- Teachers: http://localhost:3001/teachers
- AI Grading: http://localhost:3001/ai-grading
- Pathways: http://localhost:3001/pathways

**Support Files:**
- Backend: `/backend`
- Frontend: `/frontend`
- Sample tests: `/backend/test_*.json`

---

## 🚀 You're Ready!

Everything is set up and tested. Tomorrow's pilot will:
1. Take 30-60 minutes total
2. Cost less than 1 cent
3. Give you real data on AI accuracy
4. Show time savings potential
5. Identify any issues to fix

**Start servers, go to `/ai-grading`, and begin testing!**

Good luck with your pilot! 🎓✨

---

**Quick Links:**
- Start here: http://localhost:3001/ai-grading
- API health: http://localhost:8000/api/v1/ai/health
- Features list: http://localhost:8000/api/v1/ai/features

**Note:** Frontend runs on port 3001 (not 3000) because port 3000 is already in use. This is automatic and normal.
