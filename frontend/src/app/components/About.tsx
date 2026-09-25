import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { Code, Palette, Zap } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const features = [
    {
      icon: Code,
      title: 'Clean Code',
      description: 'Writing maintainable and scalable code following best practices',
    },
    {
      icon: Palette,
      title: 'Creative Design',
      description: 'Crafting beautiful and intuitive user interfaces',
    },
    {
      icon: Zap,
      title: 'Performance',
      description: 'Building fast and optimized applications',
    },
  ];

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-20 md:py-32 bg-gradient-to-b from-black via-gray-900 to-black"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-gray-300 bg-clip-text text-transparent">
            About Me
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-gray-600/20 blur-3xl rounded-full" />
            <div className="relative rounded-2xl overflow-hidden border border-gray-800">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1621743018966-29194999d736?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBkZXNrfGVufDF8fHx8MTc3MjAxNjQwN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Workspace"
                className="w-full h-auto"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-3xl font-bold mb-6 text-white">
              Passionate Developer & Designer
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              With over 5 years of experience in web development, I specialize in creating
              exceptional digital experiences. My journey in tech has been driven by a passion
              for solving complex problems and bringing creative ideas to life.
            </p>
            <p className="text-gray-400 mb-6 leading-relaxed">
              I believe in writing clean, efficient code and designing interfaces that not only
              look great but provide seamless user experiences. I'm constantly learning and
              adapting to new technologies to stay at the forefront of web development.
            </p>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">5+</div>
                <div className="text-gray-500 text-sm">Years Exp.</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">50+</div>
                <div className="text-gray-500 text-sm">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">30+</div>
                <div className="text-gray-500 text-sm">Clients</div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.2 }}
              whileHover={{ y: -10 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-gray-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative p-8 bg-gray-900/50 border border-gray-800 rounded-2xl backdrop-blur-sm group-hover:border-blue-500/50 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-white" size={24} />
                </div>
                <h4 className="text-xl font-bold mb-3 text-white">{feature.title}</h4>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
