import type { program } from '@/app/lib/types/pillars/fitness';

export const DefaultProgram: program = {
    id: 0,
    program_name: '',
    user_id: 0,
    phase_focus: 'GPP',
    periodization_type: 'None',
    progression_rules: {
        type: 'None',
        settings: {
            volume_increment_percentage: 0,
            load_increment_percentage: 0,
            program_length: 4,
            weekly_volume_percentages: [100, 80, 90, 60]
        }
    },
    start_date: new Date(),
    end_date: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    notes: ''
};