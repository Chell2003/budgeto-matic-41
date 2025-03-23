
import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import InsightCard, { InsightType } from '@/components/insights/InsightCard';

const Insights = () => {
  const insights = [
    {
      title: 'Reduced Food Spending',
      description: 'Your spending on food has decreased compared to last month.',
      type: 'spending' as InsightType,
      changePercentage: -12,
      actionLabel: 'See details',
    },
    {
      title: 'Increased Savings',
      description: 'You saved more this month than your monthly average.',
      type: 'savings' as InsightType,
      changePercentage: 15,
      actionLabel: 'View savings',
    },
    {
      title: 'Spending Tip',
      description: 'Set up automatic transfers to your savings account on payday.',
      type: 'tip' as InsightType,
      actionLabel: 'Learn more',
    },
    {
      title: 'Income Increase',
      description: 'Your total income increased compared to last month.',
      type: 'income' as InsightType,
      changePercentage: 5,
      actionLabel: 'View income',
    },
  ];

  return (
    <MobileLayout currentPage="insights">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-muted-foreground mt-1">Financial analysis and tips</p>
      </header>

      <div className="grid gap-4">
        {insights.map((insight, index) => (
          <InsightCard
            key={index}
            title={insight.title}
            description={insight.description}
            type={insight.type}
            changePercentage={insight.changePercentage}
            actionLabel={insight.actionLabel}
          />
        ))}
      </div>
    </MobileLayout>
  );
};

export default Insights;
