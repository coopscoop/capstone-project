import { Search } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';

const ExplorePage = () => {

  // TODO: placeholder data - replace with real data/queries from backend once that's in place
  const projects = [
    {
      title: "Simple perceptron",
      tags: ["AI", "Machine Learning", "Primitive", "Perceptron"],
      description: "A very simple implementation of the perceptron based on the 1943 paper. This is a good starting point for learning about neural networks.",
      favorited: true
    },
    {
      title: "Neural Network",
      tags: ["Deep Learning", "Python"],
      description: "A basic neural network implementation from scratch",
      favorited: false
    },
    {
      title: "Image Classifier",
      tags: ["Computer Vision", "AI", "Machine Learning"],
      description: "CNN-based image classification system",
      favorited: true
    },
    {
      title: "NLP Sentiment",
      tags: ["NLP", "Text Analysis"],
      description: "Sentiment analysis using transformer models",
      favorited: false
    },
    {
      title: "Reinforcement Learning",
      tags: ["RL", "Gaming"],
      description: "Q-learning agent for game playing",
      favorited: false
    },
    {
      title: "Data Pipeline",
      tags: ["ETL", "Data Engineering"],
      description: "Automated data processing pipeline",
      favorited: true
    }
  ];

  return (
    <div className="h-full flex flex-col bg-dark-bg">
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* Search Bar */}
          <div className="mb-12 bg-white rounded-3xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input
                type="text"
                placeholder="Search for projects..."
                className="w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Projects List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              tags={project.tags}
              description={project.description}
              favorited={project.favorited}
              onOpen={() => console.log(`Opening ${project.title}`)}
            />
          ))}
        </div>

        </div>
      </div>
    </div>
  );
};

export default ExplorePage;