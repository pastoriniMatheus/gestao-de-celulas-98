
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MonthlyBirthdayContact {
  id: string;
  name: string;
  birth_date: string;
  whatsapp: string | null;
  age: number | null;
  day: number;
}

export const useMonthlyBirthdays = () => {
  const [monthlyBirthdays, setMonthlyBirthdays] = useState<MonthlyBirthdayContact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonthlyBirthdays = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, birth_date, whatsapp')
        .not('birth_date', 'is', null)
        .eq('status', 'member');

      if (error) {
        console.error('Erro ao buscar aniversariantes do mês:', error);
        return;
      }

      // Filtrar por mês e calcular idade
      const monthBirthdays = data
        ?.filter(contact => {
          const birthMonth = new Date(contact.birth_date).getMonth() + 1;
          return birthMonth === currentMonth;
        })
        .map(contact => {
          const birthDate = new Date(contact.birth_date);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          const day = birthDate.getDate();
          
          return {
            ...contact,
            age,
            day
          };
        })
        .sort((a, b) => a.day - b.day) || [];

      setMonthlyBirthdays(monthBirthdays);
    } catch (error) {
      console.error('Erro ao buscar aniversariantes do mês:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyBirthdays();
  }, []);

  return {
    monthlyBirthdays,
    loading,
    refreshMonthlyBirthdays: fetchMonthlyBirthdays
  };
};
