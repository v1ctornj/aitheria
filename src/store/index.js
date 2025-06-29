import { create } from 'zustand';

const useStore = create((set) => ({
  userId: null,
  projects: [],
  interviews: [],
  setUserId: (id) => set({ userId: id }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  setProjects: (projects) => set({ projects }),
  addInterview: (interview) => set((state) => ({ interviews: [...state.interviews, interview] })),
  setInterviews: (interviews) => set({ interviews }),
  clearState: () => set({ userId: null, projects: [], interviews: [] }),
}));

export default useStore;