
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, LineChart, LightbulbIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export type InsightType = 'spending' | 'savings' | 'income' | 'tip';

interface InsightCardProps {
  title: string;
  description: string;
  type: InsightType;
  changePercentage?: number;
  actionLabel?: string;
  onClick?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  type,
  changePercentage,
  actionLabel,
  onClick,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'spending':
        return TrendingDown;
      case 'savings':
        return LineChart;
      case 'income':
        return TrendingUp;
      case 'tip':
        return LightbulbIcon;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'spending':
        return 'bg-finance-expense/10';
      case 'savings':
        return 'bg-finance-saving/10';
      case 'income':
        return 'bg-finance-income/10';
      case 'tip':
        return 'bg-purple-100';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'spending':
        return 'text-finance-expense';
      case 'savings':
        return 'text-finance-saving';
      case 'income':
        return 'text-finance-income';
      case 'tip':
        return 'text-purple-600';
    }
  };

  const Icon = getIcon();

  return (
    <Card className="overflow-hidden bg-white shadow-subtle press-effect" onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            getBackgroundColor()
          )}>
            <Icon size={18} className={getTextColor()} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
            
            {changePercentage !== undefined && (
              <div className={cn(
                "text-xs font-medium mt-2 flex items-center",
                changePercentage > 0 ? "text-finance-income" : "text-finance-expense"
              )}>
                {changePercentage > 0 ? (
                  <TrendingUp size={14} className="mr-1" />
                ) : (
                  <TrendingDown size={14} className="mr-1" />
                )}
                <span>{Math.abs(changePercentage)}% {changePercentage > 0 ? 'increase' : 'decrease'}</span>
              </div>
            )}
            
            {actionLabel && (
              <div className="mt-2 flex items-center text-xs font-medium text-primary">
                <span>{actionLabel}</span>
                <ArrowRight size={12} className="ml-1" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightCard;
